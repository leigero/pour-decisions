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
} from '../../services/supabase/models';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';

type DashboardView = 'main' | 'menu' | 'orders';

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
  public readonly view2 = signal<DashboardView>('main');

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

    if (this.router.url.includes('menu-editor')) {
      this.view2.set('menu');
    } else {
      this.view2.set('main');
    }
  }

  ngOnDestroy(): void {
    if (this.orderSubscription) {
      this.supabase.removeSubscription(this.orderSubscription);
    }
  }

  public navigate(view: DashboardView) {
    this.view2.set(view);

    switch (view) {
      case 'main':
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
