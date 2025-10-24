import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OrderService,
  OrderStatus,
  OrderWithDetails,
} from '@pour-decisions/supabase';
import { TonicModal } from '@pour-decisions/tonic/fundamentals';

@Component({
  selector: 'pd-host-order',
  standalone: true,
  imports: [CommonModule, TonicModal],
  templateUrl: './host-order.html',
  styleUrls: ['./host-order.scss'],
})
export class HostOrder {
  public orderService = inject(OrderService);
  public order = input.required<OrderWithDetails>();
  public close = output();
  public updated = output<OrderWithDetails>();

  public showConfirmCancel = signal(false);

  public async updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
      // Make the actual call to the backend
      await this.orderService.updateOrderStatus(orderId, status);
      this.updated.emit({ ...this.order(), status });
      this.close.emit();
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Optional: Add logic here to revert the optimistic update on failure
    }
  }

  public requestCancelOrder() {
    this.showConfirmCancel.set(true);
  }
}
