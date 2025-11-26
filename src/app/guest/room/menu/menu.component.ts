import {
  Component,
  OnInit,
  signal,
  inject,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Drink, MenuService, Room } from '@pour-decisions/supabase';
import { DrinkSummaryComponent } from '@pour-decisions/shared';

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

  public readonly searchTerm = signal('');
  private readonly collapsedTypes = signal<Set<string>>(new Set());

  public readonly filteredDrinks = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.drinks();

    return this.drinks().filter((drink) => this.matchesSearch(drink, term));
  });

  // Drinks grouped by type for display
  public readonly groupedDrinks = computed(() => {
    const groups = new Map<string, Drink[]>();

    for (const drink of this.filteredDrinks()) {
      const type = this.normalizeType(drink.type);
      const groupDrinks = groups.get(type) ?? [];
      groupDrinks.push(drink);
      groups.set(type, groupDrinks);
    }

    return Array.from(groups.entries())
      .map(([type, drinks]) => ({
        type,
        drinks: [...drinks].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.type.localeCompare(b.type));
  });

  public toLobby = output();
  public orderDrink = output<{ drinkId: string; notes: string }>();

  public viewDrink = output<Drink>();

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      // Fetch the full list of available drinks
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

  public toggleGroup(type: string): void {
    const normalized = this.normalizeType(type);
    const next = new Set(this.collapsedTypes());
    if (next.has(normalized)) {
      next.delete(normalized);
    } else {
      next.add(normalized);
    }
    this.collapsedTypes.set(next);
  }

  public isCollapsed(type: string): boolean {
    return this.collapsedTypes().has(this.normalizeType(type));
  }

  private normalizeType(type: Drink['type'] | string): string {
    const fallback = 'Other';
    if (!type) return fallback;
    const trimmed = type.toString().trim();
    return trimmed.length ? trimmed : fallback;
  }

  public formatType(type: string): string {
    if (!type) return 'Other';
    return type
      .split(/[\s|_-]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ');
  }

  private matchesSearch(drink: Drink, term: string): boolean {
    const nameMatch = drink.name?.toLowerCase().includes(term);
    const typeMatch = this.normalizeType(drink.type).toLowerCase().includes(term);
    const ingredientsMatch = (drink.ingredients ?? [])
      .some((ingredient) => ingredient.toLowerCase().includes(term));

    return Boolean(nameMatch || typeMatch || ingredientsMatch);
  }
}
