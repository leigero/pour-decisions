import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  Signal,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase/supabase.service';
import {
  Room,
  OrderWithDetails,
  Drink,
  Order,
  OrderStatus,
} from '../../services/supabase/models';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';

type DashboardView = 'main' | 'menu' | 'orders'; // This can be simplified or removed if 'orders' route is not planned

@Component({
  selector: 'pd-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly roomId: string;
  private orderSubscription: RealtimeChannel;

  public readonly room = signal<Room | undefined>(undefined);
  public readonly drinks = signal<Drink[]>([]);
  public readonly orders = signal<OrderWithDetails[]>([]);
  public readonly selectedOrder = signal<OrderWithDetails | null>(null);

  // Signal to manage the text of the copy button for user feedback
  public readonly copyButtonText = signal('Share');

  public readonly activeOrders = computed(() => {
    const nonActiveStatuses = ['served', 'cancelled'];
    return this.orders().filter(
      (order) => !nonActiveStatuses.includes(order.status),
    );
  });
  constructor() {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
  }

  async ngOnInit() {
    const thisRoom = await this.supabase.getRoomById(this.roomId);
    this.room.set(thisRoom);

    const drinks = await this.supabase.getDrinks();
    this.drinks.set(drinks);

    const orders = await this.supabase.getOrdersForRoom(this.room().id);
    this.orders.set(orders);

    // Set up the real-time subscription for ALL order changes.
    this.orderSubscription = this.supabase.onOrderChanges(
      this.room().id,
      (payload) => {
        console.log('Realtime event received!', payload);

        switch (payload.eventType) {
          case 'INSERT':
            // A new order was created. Fetch its details and add it to our signal.
            this.supabase
              .getSingleOrderForRoom(payload.new['id'])
              .then((newOrder) => {
                if (newOrder) {
                  this.orders.update((currentOrders) => [
                    ...currentOrders,
                    newOrder,
                  ]);
                }
              });
            break;

          case 'UPDATE':
            // An order was updated. Fetch its new details and replace the old one.
            this.supabase
              .getSingleOrderForRoom(payload.new['id'])
              .then((updatedOrder) => {
                if (updatedOrder) {
                  this.orders.update((currentOrders) =>
                    currentOrders.map((order) =>
                      order.id === updatedOrder.id ? updatedOrder : order,
                    ),
                  );
                }
              });
            break;

          case 'DELETE':
            // An order was deleted. Remove it from the signal.
            const deletedOrderId = payload.old['id'];
            if (deletedOrderId) {
              this.orders.update((currentOrders) =>
                currentOrders.filter((order) => order.id !== deletedOrderId),
              );
            }
            break;
        }
      },
    );
  }

  /** Opens the modal and sets the selected order. */
  public viewOrderDetails(order: OrderWithDetails): void {
    this.selectedOrder.set(order);
  }

  /** Closes the modal by clearing the selected order. */
  public closeOrderModal(): void {
    this.selectedOrder.set(null);
  }

  /** Updates an order's status and provides immediate UI feedback. */
  public async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<void> {
    // Optimistically update the local 'orders' signal for a snappy UX
    this.orders.update((currentOrders) =>
      currentOrders.map((o) =>
        o.id === orderId ? { ...o, status: status } : o,
      ),
    );

    // If the order being updated is the one in the modal, close the modal
    if (this.selectedOrder()?.id === orderId) {
      this.closeOrderModal();
    }

    try {
      // Make the actual call to the backend
      await this.supabase.updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Optional: Add logic here to revert the optimistic update on failure
    }
  }

  ngOnDestroy(): void {
    if (this.orderSubscription) {
      this.supabase.removeSubscription(this.orderSubscription);
    }
  }

  public navigate(view: 'main' | 'menu' | 'orders') {
    switch (view) {
      case 'main':
        console.log('switch to main view');
        this.router.navigate(['./'], { relativeTo: this.route });
        break;
      case 'menu':
        this.router.navigate(['menu-editor'], { relativeTo: this.route });
        break;
      case 'orders':
        this.router.navigate(['orders'], { relativeTo: this.route });
        break;
    }
  }

  // copy the guest invite link to the clipboard
  public copyInviteLink(): void {
    const roomCode = this.room()?.code;
    if (!roomCode) return;

    // Construct the full URL for the guest page
    const guestUrl = `${window.location.origin}/room/${roomCode}`;

    navigator.clipboard
      .writeText(guestUrl)
      .then(() => {
        // Provide feedback to the user
        this.copyButtonText.set('Copied!');
        setTimeout(() => this.copyButtonText.set('Share'), 2000);
      })
      .catch((err) => console.error('Failed to copy text: ', err));
  }
}
