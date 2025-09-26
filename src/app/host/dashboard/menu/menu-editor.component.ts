import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
  input,
} from '@angular/core';
import { OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase/supabase.service';
import { Drink, Room } from '../../../services/supabase/models';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DrinkDetailsComponent } from '../../../shared/drink/drink-details/drink-details.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

export interface DrinkVM extends Drink {
  isSelected: boolean;
}

@Component({
  selector: 'pd-menu-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DrinkDetailsComponent],
  templateUrl: './menu-editor.component.html',
  styleUrls: ['./menu-editor.component.scss'],
})
export class MenuEditorComponent implements OnInit, OnDestroy {
  public readonly room = input.required<Room>();

  private supabase = inject(SupabaseService);

  public readonly drinks = signal<DrinkVM[]>([]);
  public readonly isLoading = signal(false);
  public readonly hasError = signal(false);
  public readonly isSaving = signal(false);

  // Subject to handle debouncing the save operation
  private menuUpdate$ = new Subject<void>();
  private menuUpdateSubscription: Subscription;

  // NEW: Signal to track the ID of the currently expanded drink
  public readonly expandedDrinkId = signal<string | null>(null);

  public selectedDrinks = computed(() => {
    return this.drinks().filter((d) => d.isSelected);
  });

  constructor() {}

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      const allDrinks = await this.supabase.getDrinks();
      const roomDrinks = await this.supabase.getDrinksForRoom(this.room().id);
      const selectedDrinkIdSet = new Set(roomDrinks.map((d) => d.id));

      const drinkVMs = allDrinks.map((d) => ({
        ...d,
        isSelected: selectedDrinkIdSet.has(d.id),
      }));

      this.drinks.set(drinkVMs);
    } catch (error) {
      this.hasError.set(true);
      console.error('Error fetching drinks:', error);
    } finally {
      this.isLoading.set(false);
    }

    // Set up the debounced auto-save subscription
    this.menuUpdateSubscription = this.menuUpdate$
      .pipe(
        debounceTime(1000), // Wait for 1.5 seconds of inactivity
        switchMap(() => this.saveMenu()), // Trigger the save operation
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    // Clean up the subscription to prevent memory leaks
    if (this.menuUpdateSubscription) {
      this.menuUpdateSubscription.unsubscribe();
    }
  }

  // NEW: Toggles the selection state of a drink
  toggleSelection(drink: DrinkVM): void {
    drink.isSelected = !drink.isSelected;
    // Notify the subject that a change has occurred
    this.menuUpdate$.next();
  }

  // NEW: Toggles the visibility of the drink details
  toggleDetails(drinkId: string): void {
    if (this.expandedDrinkId() === drinkId) {
      this.expandedDrinkId.set(null); // Close if already open
    } else {
      this.expandedDrinkId.set(drinkId); // Open the clicked one
    }
  }

  private async saveMenu() {
    this.isSaving.set(true);
    try {
      await this.supabase.assignDrinksToRoom(
        this.room().id,
        this.selectedDrinks(),
      );
      // Optionally, show a success message
    } catch (error) {
      console.error('Error saving menu:', error);
      // Optionally, show an error message
    } finally {
      this.isSaving.set(false);
    }
  }
}
