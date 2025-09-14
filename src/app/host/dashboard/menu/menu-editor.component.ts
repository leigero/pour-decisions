import { Component, OnInit, signal, inject, computed, WritableSignal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase/supabase.service';
import { Drink, Room } from '../../../services/supabase/models';
import { ActivatedRoute } from '@angular/router';
import { DrinkComponent } from '../../../shared/drink/drink.component';
import { FormsModule } from '@angular/forms';

export interface DrinkVM extends Drink {
    isSelected: boolean;
}

@Component({
  selector: 'pd-menu-editor',
  standalone: true,
  imports: [
    CommonModule,
    DrinkComponent,
    FormsModule
  ],
  templateUrl: './menu-editor.component.html',
  styleUrls: ['./menu-editor.component.scss'],
})
export class MenuEditorComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  
  public readonly room = input.required<Room>();

  public readonly drinks = signal<DrinkVM[]>([]);

  public selectedDrinks = computed(() => {
    const drinks = this.drinks();
    return drinks.filter(d => d.isSelected);
  });

  // Placeholder signals and properties for visual binding
  public readonly isLoading = signal(false);
  public readonly hasError = signal(false);
  public readonly isSaving = signal(false);

  constructor(){
    
  }

  async ngOnInit() {
    const drinks = await this.supabase.getDrinks();
    const drinkVMs = drinks.map(d =>{
        return {...d, isSelected : false};
    });
    this.drinks.set(drinkVMs);

  }
  public async allDrinks(){

  }

  // A Set to simulate which drinks are currently selected
  selectedDrinkIds = new Set<string>(['1', '3']);

  // Computed signal to check if a drink is selected
  isSelected = (drinkId: string) => this.selectedDrinkIds.has(drinkId);

  // Placeholder methods for binding
//   toggleSelection(drink: DrinkVM) {
    
//     drink.isSelected.!drink.isSelected);
//   }

  saveMenu() {
    this.isSaving.set(true);
    // You will add your actual save logic here.
    setTimeout(() => {
        this.isSaving.set(false);
        console.log('Saved changes:', this.selectedDrinkIds);
    }, 2000);
  }

}