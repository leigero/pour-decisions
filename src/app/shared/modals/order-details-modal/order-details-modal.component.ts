import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderWithDetails } from '@pour-decisions/supabase';

import { DrinkDetailsComponent } from '../../drink/drink-details/drink-details.component';
import { TonicModal } from '@pour-decisions/tonic/fundamentals';

@Component({
  selector: 'pd-order-details-modal',
  standalone: true,
  imports: [CommonModule, DrinkDetailsComponent, TonicModal],
  templateUrl: './order-details-modal.component.html',
  styleUrls: ['./order-details-modal.component.scss'],
})
export class OrderDetailsModalComponent {
  // INPUT: The data this component needs to display.
  public readonly order = input.required<OrderWithDetails>();

  // OUTPUTS: Events this component sends back to the parent.
  public readonly close = output<void>();
  public readonly cancelOrder = output<string>(); // Emits the orderId
}
export class OrderDetailsModal {}
