import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
  WritableSignal,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase/supabase.service';
import { Drink, Room } from '../../../services/supabase/models';
import { ActivatedRoute } from '@angular/router';
import { DrinkDetailsComponent } from '../../../shared/drink/drink-details/drink-details.component';
import { FormsModule } from '@angular/forms';

export interface DrinkVM extends Drink {
  isSelected: boolean;
}

@Component({
  selector: 'pd-menu-editor',
  standalone: true,
  imports: [CommonModule, DrinkDetailsComponent, FormsModule],
  templateUrl: './menu-editor.component.html',
  styleUrls: ['./menu-editor.component.scss'],
})
export class MenuEditorComponent implements OnInit {
  public readonly roomId: string;

  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);

  public readonly drinks = signal<DrinkVM[]>([]);

  public selectedDrinks = computed(() => {
    const drinks = this.drinks();
    return drinks.filter((d) => d.isSelected);
  });

  // Placeholder signals and properties for visual binding
  public readonly isLoading = signal(false);
  public readonly hasError = signal(false);
  public readonly isSaving = signal(false);

  constructor() {
    // Access the parent route's parameters to get the roomId
    this.roomId = this.route.parent.snapshot.paramMap.get('roomId');
  }

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      // Step 1: Fetch the full list of available drinks
      const allDrinks = await this.supabase.getDrinks();
      console.log(allDrinks);
      // Step 2: Fetch the drinks already selected for this room
      const selectedDrinkIds = await this.supabase.getDrinksForRoom(
        this.roomId,
      );
      console.log('selectedDrinkIds ', selectedDrinkIds);
      //Step 3: Map the full list to a VM, setting isSelected based on the fetched data
      const selectedDrinkIdSet = new Set(selectedDrinkIds.map((d) => d.id));

      const drinkVMs = allDrinks.map((d) => {
        return { ...d, isSelected: selectedDrinkIdSet.has(d.id) };
      });

      this.drinks.set(drinkVMs);
    } catch (error) {
      this.hasError.set(true);
      console.error('Error fetching drinks:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  saveMenu() {
    this.isSaving.set(true);
    // You will add your actual save logic here.
    setTimeout(() => {
      this.isSaving.set(false);
      this.supabase.assignDrinksToRoom(this.roomId, this.selectedDrinks());
    }, 2000);
  }
}
