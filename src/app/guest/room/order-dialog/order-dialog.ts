import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  input,
  output,
  signal,
  OnInit,
  OnDestroy,
} from "@angular/core";

import { Drink, Order, OrderService, OrderWithDetails } from "@pour-decisions/supabase";
import { TonicModal } from "@pour-decisions/tonic/fundamentals";

@Component({
  selector: 'pd-order-dialog',
  imports: [CommonModule, TonicModal],
  templateUrl: './order-dialog.html',
  styleUrls: ['./order-dialog.scss'],

})
export class OrderDialog implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private resizeListener?: () => void;

  public readonly drink = input.required<Drink>();
  public readonly roomId = input.required<string>();
  public readonly guestId = input.required<string>();
  public readonly order = input<OrderWithDetails>();  
  
  protected readonly showNotes = signal(false);
  protected readonly notes = signal<string | null>(null);  
  protected readonly isMobile = signal(false);

  public readonly close = output<boolean>();

  ngOnInit(): void {
    this.syncIsMobile();

    if (typeof window !== 'undefined') {
      const handler = () => this.syncIsMobile();
      window.addEventListener('resize', handler);
      this.resizeListener = () => window.removeEventListener('resize', handler);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      this.resizeListener();
    }
  }

  private syncIsMobile(): void {
    if (typeof window === 'undefined') {
      this.isMobile.set(false);
      return;
    }

    const mobile = window.innerWidth <= 640 || window.matchMedia?.('(max-width: 640px)').matches;
    this.isMobile.set(mobile);
  }

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
