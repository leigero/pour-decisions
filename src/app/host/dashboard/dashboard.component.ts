import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';

import {
  Drink,
  MenuService,
  OrderService,
  OrderStatus,
  OrderWithDetails,
  Room,
  RoomService,
} from '@pour-decisions/services/supabase';
import { TonicIcon } from '@pour-decisions/tonic/icons';
import { TonicQrCode } from '@pour-decisions/tonic/fundamentals';
import { Share } from '@pour-decisions/tonic/icons/svgs';

import { MenuEditorComponent } from './menu/menu-editor.component';
import { OrderListComponent } from './order-list/order-list.component';
import { HostOrder } from 'src/app/host/dashboard/host-order/host-order';

type DashboardView = 'orders' | 'menu' | 'share';

@Component({
  selector: 'pd-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TonicIcon,
    TonicQrCode,
    MenuEditorComponent,
    OrderListComponent,
    HostOrder,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private roomService = inject(RoomService);
  private menuService = inject(MenuService);
  private orderService = inject(OrderService);
  public readonly selectedOrder = signal<OrderWithDetails | null>(null);
  private route = inject(ActivatedRoute);

  private readonly roomId: string;
  private orderSubscription: RealtimeChannel;

  public readonly room = signal<Room | undefined>(undefined);
  public readonly drinks = signal<Drink[]>([]);
  public readonly orders = signal<OrderWithDetails[]>([]);
  public readonly view = signal<DashboardView>('orders');

  // visibility handler for re-activating db subscription
  private pageFocusHandler = this.handlePageFocus.bind(this);

  // Signal to manage the text of the copy button for user feedback
  public readonly copyButtonText = signal('Share');
  private readonly isSharing = signal(false);

  // Computed guest URL and QR image URL for the Share tab
  public readonly guestUrl = computed(() => {
    const code = this.room()?.code;
    return code ? `${window.location.origin}/room/${code}` : '';
  });

  // QR image now generated locally via TonicQrCode component

  public readonly activeOrders = computed(() => {
    const nonActiveStatuses = ['served', 'cancelled'];
    return this.orders().filter(
      (order) => !nonActiveStatuses.includes(order.status),
    );
  });

  protected icons = { Share };
  constructor() {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
  }

  async ngOnInit() {
    const thisRoom = await this.roomService.getRoomById(this.roomId);
    this.room.set(thisRoom);

    const drinks = await this.menuService.getDrinks();
    this.drinks.set(drinks);

    const orders = await this.orderService.getOrdersForRoom(this.room().id);
    this.orders.set(orders);

    // Initial data load and subscription setup
    await this.refreshDataAndSubscription();

    // Add the event listener to handle re-subscribing on tab focus
    document.addEventListener('visibilitychange', this.pageFocusHandler);
    window.addEventListener('pageshow', this.pageFocusHandler);
  }

  ngOnDestroy(): void {
    if (this.orderSubscription) {
      this.orderService.removeSubscription(this.orderSubscription);
    }
    // Clean up the event listener to prevent memory leaks
    document.removeEventListener('visibilitychange', this.pageFocusHandler);
    window.removeEventListener('pageshow', this.pageFocusHandler);
  }

  private handlePageFocus(): void {
    // We only care about when the page becomes visible.
    // The `pageshow` event doesn't have a state, it just fires, so we don't need a check for it.
    if (document.visibilityState === 'visible') {
      this.refreshDataAndSubscription();
    }
  }

  private async refreshDataAndSubscription(): Promise<void> {
    if (!this.room()?.id) return; // Guard clause

    console.log('Refreshing data and re-activating subscription...');

    // 1. Re-fetch all orders to sync the current state immediately
    const orders = await this.orderService.getOrdersForRoom(this.room().id);
    this.orders.set(orders);

    // 2. Re-establish the real-time subscription for future updates
    this.setupSubscription();
  }

  private setupSubscription(): void {
    // If a subscription already exists, remove it first to ensure a clean state
    if (this.orderSubscription) {
      this.orderService.removeSubscription(this.orderSubscription);
    }

    // Create the new subscription for all order changes in the room
    this.orderSubscription = this.orderService.onOrderChanges(
      this.room().id,
      (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            // A new order was created. Fetch its full details to include guest/drink info.
            this.orderService
              .getSingleOrderForRoom(payload.new['id'])
              .then((newOrder) => {
                if (newOrder) {
                  this.orders.update((currentOrders) =>
                    // Add to the start of the array for most recent first
                    [newOrder, ...currentOrders],
                  );
                }
              });
            break;

          case 'UPDATE':
            // An order was updated. Fetch its new details and replace the old one.
            this.orderService
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

  public onOrderUpdated(updatedOrder: OrderWithDetails) {
    this.orders.update((currentOrders) =>
      currentOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      ),
    );
  }

  /** Opens the modal and sets the selected order. */
  public viewOrderDetails(order: OrderWithDetails): void {
    this.selectedOrder.set(order);
  }

  public navigate(view: DashboardView) {
    this.view.set(view);
  }

  // copy the guest invite link to the clipboard or share in mobile
  public copyInviteLink(): void {
    // Prevent multiple share dialogs from opening at once.
    if (this.isSharing()) return;

    const roomCode = this.room()?.code;
    if (!roomCode) return;

    const guestUrl = `${window.location.origin}/room/${roomCode}`;
    const shareData = {
      title: 'Join my Pour Decisions room!',
      text: `Join my Pour Decisions room with code: ${roomCode}`,
      url: guestUrl,
    };

    if (navigator.share) {
      this.isSharing.set(true);
      // Call navigator.share() synchronously and handle the promise it returns.
      // This preserves the "user-initiated" context required by the browser.
      navigator
        .share(shareData)
        .catch((err) => {
          // This can happen if the user cancels the share dialog.
          if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        })
        .finally(() => {
          this.isSharing.set(false);
        });
    } else {
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
}
