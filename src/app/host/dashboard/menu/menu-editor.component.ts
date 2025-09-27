import { Component, OnInit, signal, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../services/supabase/menu.service';
import { Drink, Room } from '../../../services/supabase/models';
import { FormsModule } from '@angular/forms';
import { DrinkDetailsComponent } from '../../../shared/drink/drink-details/drink-details.component';

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
export class MenuEditorComponent implements OnInit {
  public readonly room = input.required<Room>();

  private menuService = inject(MenuService);

  public readonly drinks = signal<DrinkVM[]>([]);
  public readonly isLoading = signal(false);
  public readonly hasError = signal(false);

  // NEW: Signal to track the ID of the currently expanded drink
  public readonly expandedDrinkId = signal<string | null>(null);

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      const allDrinks = await this.menuService.getDrinks();
      const roomDrinks = await this.menuService.getDrinksForRoom(
        this.room().id,
      );
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
  }

  // NEW: Toggles the selection state of a drink
  async toggleSelection(drink: DrinkVM): Promise<void> {
    // Optimistically update the UI
    drink.isSelected = !drink.isSelected;

    try {
      if (drink.isSelected) {
        await this.menuService.addDrinkToRoom(this.room().id, drink.id);
      } else {
        await this.menuService.removeDrinkFromRoom(this.room().id, drink.id);
      }
    } catch (error) {
      // If the API call fails, revert the optimistic update
      drink.isSelected = !drink.isSelected;
      console.error('Failed to update menu:', error);
      // Optionally, show an error toast to the user
    }
  }

  // NEW: Toggles the visibility of the drink details
  toggleDetails(drinkId: string): void {
    if (this.expandedDrinkId() === drinkId) {
      this.expandedDrinkId.set(null); // Close if already open
    } else {
      this.expandedDrinkId.set(drinkId); // Open the clicked one
    }
  }
}
