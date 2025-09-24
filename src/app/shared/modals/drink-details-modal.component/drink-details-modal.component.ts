import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drink } from '../../../services/supabase/models';
import { DrinkDetailsComponent } from '../../drink/drink-details/drink-details.component';

@Component({
  selector: 'pd-drink-details-modal',
  standalone: true,
  imports: [CommonModule, DrinkDetailsComponent],
  templateUrl: './drink-details-modal.component.html',
  styleUrls: ['./drink-details-modal.component.scss'],
})
export class DrinkDetailsModalComponent {
  // INPUT: The drink to display
  public readonly drink = input.required<Drink>();

  // OUTPUTS: Events for the parent component to handle
  public readonly close = output<void>();
  public readonly order = output<string>(); // Emits the drinkId
}
