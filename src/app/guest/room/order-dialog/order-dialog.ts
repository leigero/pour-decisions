import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";

import { Drink, Order, OrderService, OrderWithDetails } from "@pour-decisions/supabase";
import { TonicModal } from "@pour-decisions/tonic/fundamentals";

@Component({
  selector: 'pd-order-dialog',
  imports: [CommonModule, TonicModal],
  templateUrl: './order-dialog.html',
  styleUrls: ['./order-dialog.scss'],

})
export class OrderDialog {
  private readonly orderService = inject(OrderService);

  public readonly drink = input.required<Drink>();
  public readonly roomId = input.required<string>();
  public readonly guestId = input.required<string>();
  public readonly order = input<OrderWithDetails>();  
  
  protected readonly showNotes = signal(false);
  protected readonly notes = signal<string | null>(null);  

  public readonly close = output<boolean>();

  public showNotesField(): void {
    this.showNotes.set(true);
  }

  public onNotesChange(value: string): void {
    const trimmed = value?.trim();
    this.notes.set(trimmed ? trimmed : null);
  }

  protected async placeOrder() {
    const order: Partial<Order> = {};
    order.drink_id = this.drink().id;
    order.room_id = this.roomId();
    order.guest_id = this.guestId();
    order.notes = this.notes();


    try {
      await this.orderService.placeOrder(order);
      this.close.emit(true);
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  }
  
  protected async cancelOrder() {
    const order = this.order();
    if(!order) {
      return;
    }

    try {
      await this.orderService.updateOrderStatus(order.id, 'cancelled');      
      this.close.emit(true);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  }
}
