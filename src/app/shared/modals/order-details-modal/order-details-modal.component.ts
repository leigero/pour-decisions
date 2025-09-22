import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderVM } from '../../models/vm.models';

@Component({
  selector: 'pd-order-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details-modal.component.html',
  styleUrls: ['./order-details-modal.component.scss'],
})
export class OrderDetailsModalComponent {
  // INPUT: The data this component needs to display.
  public readonly order = input.required<OrderVM>();

  // OUTPUTS: Events this component sends back to the parent.
  public readonly close = output<void>();
  public readonly cancelOrder = output<string>(); // Emits the orderId
}
export class OrderDetailsModal {}
