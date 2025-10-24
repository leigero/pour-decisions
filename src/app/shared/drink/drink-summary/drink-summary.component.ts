import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Drink } from '@pour-decisions/supabase';

@Component({
  selector: 'pd-drink-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drink-summary.component.html',
  styleUrls: ['./drink-summary.component.scss', '../drink-styles.scss'],
})
export class DrinkSummaryComponent {
  public readonly drink = input.required<Drink>();
}
