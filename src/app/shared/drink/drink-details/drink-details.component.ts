import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drink } from '../../../services/supabase/models';

@Component({
  selector: 'pd-drink-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drink-details.component.html',
  styleUrls: ['./drink-details.component.scss', '../drink-styles.scss'],
})
export class DrinkDetailsComponent {
  public readonly drink = input.required<Drink>();
}
