import {
  Component,
  OnInit,
  signal,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MenuService } from '../../../services/supabase';
import { Drink, Room } from '../../../services/supabase/models';
import { DrinkSummaryComponent } from '../../../shared/drink/drink-summary/drink-summary.component';

@Component({
  selector: 'pd-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, DrinkSummaryComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public readonly room = input.required<Room>();

  private menuService = inject(MenuService);

  public readonly drinks = signal<Drink[]>([]);

  public readonly isLoading = signal(false);
  public readonly hasError = signal(false);

  public toLobby = output();
  public orderDrink = output<string>();

  public viewDrink = output<Drink>();

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      // Step 1: Fetch the full list of available drinks
      this.drinks.set(await this.menuService.getDrinksForRoom(this.room().id));
    } catch (error) {
      this.hasError.set(true);
      console.error('Error fetching drinks:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  public onViewDetailsClick(drink: Drink): void {
    this.viewDrink.emit(drink);
  }
}
