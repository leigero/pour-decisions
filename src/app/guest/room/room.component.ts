import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';

import {
  OrderService,
  RoomService,
  GuestService,
  StorageService,
  Room,
  Order,
  Guest,
  Drink,
  OrderWithDetails,
} from '@pour-decisions/supabase';
import {
  DrinkDetailsComponent,
  JoinRoomModalComponent,
  OrderDetailsModalComponent,
} from '@pour-decisions/shared';
import { TonicModal } from '@pour-decisions/tonic/fundamentals';

import { OrderView } from './order-view/order.view';
import { MenuComponent } from './menu/menu.component';
import { RoomHeader } from './room-header/room-header';

type GuestDashboardView = 'menu' | 'orders';

@Component({
  selector: 'pd-room',
  standalone: true,
  imports: [
    CommonModule,
    OrderView,
    MenuComponent,
    FormsModule,
    OrderDetailsModalComponent,
    JoinRoomModalComponent,
    TonicModal,
    DrinkDetailsComponent,
    RoomHeader,
  ], // Add FormsModule here
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy {
  public readonly room = signal<Room | null>(null);
  public readonly guest = signal<Guest | undefined>(undefined);
  public readonly orders = signal<OrderWithDetails[]>([]);

  private router = inject(Router);
  private orderService = inject(OrderService);
  private roomService = inject(RoomService);
  private guestService = inject(GuestService);
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);

  public readonly view = signal<GuestDashboardView>('menu');
  private roomCode: string;
  private guestId: string | null;

  // Signals for the "Guest Gate" Modal
  public readonly showJoinModal = signal(false);

  // Signal for order detail view modal
  public readonly selectedOrder = signal<OrderWithDetails | null>(null);
  public readonly selectedDrink = signal<Drink | null>(null);

  private orderSubscription: RealtimeChannel;

  constructor(private renderer: Renderer2) {
    this.roomCode = this.route.snapshot.paramMap.get('roomCode')!;
    this.guestId = this.route.snapshot.queryParamMap.get('guestId');

    effect(() => {
      if (this.selectedOrder() || this.selectedDrink()) {
        // If any modal is open, add the class to the body
        this.renderer.addClass(document.body, 'modal-open');
      } else {
        // If all modals are closed, remove the class
        this.renderer.removeClass(document.body, 'modal-open');
      }
    });
  }

  async ngOnInit() {
    const room = await this.roomService.getRoomByCode(this.roomCode);
    if (!room) {
      this.router.navigate(['/']);
      return;
    }
    this.room.set(room);

    const savedGuestId = this.getGuestIdFromStorage();
    if (savedGuestId) {
      this.guestId = savedGuestId;
      await this.loadGuestData(this.guestId);
    } else {
      // If no guest found anywhere, show the modal
      this.showJoinModal.set(true);
    }

    // Event handling moved to @HostListener bindings for Angular-friendly approach
  }

  ngOnDestroy(): void {
    if (this.orderSubscription) {
      this.orderService.removeSubscription(this.orderSubscription);
    }
  }

  @HostListener('document:visibilitychange')
  async onDocumentVisibilityChange(): Promise<void> {
    await this.handlePageFocus();
  }

  @HostListener('window:pageshow')
  async onWindowPageShow(): Promise<void> {
    await this.handlePageFocus();
  }
  /**
   * Re-establishes the real-time subscription when the user returns to the tab or app.
   * Now also re-fetches all orders to sync the state.
   */
  private async handlePageFocus(): Promise<void> {
    if (document.visibilityState === 'visible' && this.guestId) {
      console.log('Guest view is in focus, reloading guest data.');
      // Reuse your existing, correct method to refresh everything
      await this.loadGuestData(this.guestId);
    }
  }

  //TODO: this seems like should live in the order service. The only thing this component uses is a handle on the subscription
  private setupSubscription(guestId: string): void {
    // If a subscription already exists, remove it to prevent duplicates
    if (this.orderSubscription) {
      this.orderService.removeSubscription(this.orderSubscription);
    }

    // Create the new subscription
    this.orderSubscription = this.orderService.onGuestOrderChanges(
      guestId,
      (payload) => {
        console.log('Guest order update received!', payload);
        const updatedOrder = payload.new as Order;
        this.orders.update((currentOrders) =>
          currentOrders.map((order) =>
            order.id === updatedOrder.id
              ? { ...order, status: updatedOrder.status }
              : order,
          ),
        );
      },
    );
  }

  public viewDrinkDetails(drink: Drink): void {
    this.selectedDrink.set(drink);
  }

  public closeDrinkModal(): void {
    this.selectedDrink.set(null);
  }

  public viewOrderDetails(order: OrderWithDetails): void {
    this.selectedOrder.set(order);
  }

  public closeOrderModal(): void {
    this.selectedOrder.set(null);
  }

  public async cancelOrder(orderId: string): Promise<void> {
    try {
      await this.orderService.updateOrderStatus(orderId, 'cancelled');
      // Update the local state instantly for a great UX
      this.orders.update((currentOrders) =>
        currentOrders.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled' } : o,
        ),
      );
      this.closeOrderModal();
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  }

  public async handleJoinRoom(guestName: string) {
    if (!guestName || !this.room()) return;

    try {
      const newGuest = await this.roomService.joinRoom(
        this.roomCode,
        guestName,
      );
      if (newGuest) {
        this.guestId = newGuest.id;
        this.saveGuestIdToStorage(this.guestId);
        // Ensure URL is clean (no guestId)
        this.removeGuestIdFromUrl();
        await this.loadGuestData(this.guestId);
        this.showJoinModal.set(false);
      }
    } catch (error) {
      console.error('Failed to create guest:', error);
    }
  }

  private async loadGuestData(guestId: string) {
    console.log('loading guest data ', guestId);
    this.guest.set(await this.guestService.getGuestById(guestId));
    console.log(this.guest());
    if (this.guest()) {
      // Save guest to storage in case they came from welcome page
      this.saveGuestIdToStorage(guestId);

      const guest = this.guest();
      if (guest.profile_picture) {
        guest.profile_picture = this.storageService.getPublicImageUrl(
          guest.profile_picture,
        );
      } else {
        guest.profile_picture = `https://ui-avatars.com/api/?name=${guest.display_name}`;
      }
      await this.fetchOrders();
      // After fetching initial orders, set up the real-time subscription
      this.setupSubscription(guestId);
    } else {
      // If guest is not found (e.g., deleted), clear storage and show modal
      this.clearGuestIdFromStorage();
      this.showJoinModal.set(true);
    }
  }

  public navigate(view: GuestDashboardView) {
    this.view.set(view);
  }

  public async orderDrink(drinkId: string, notes: string) {
    if (!this.room() || !this.guest()) return;

    const order: Partial<Order> = {};
    order.drink_id = drinkId;
    order.notes = notes;
    order.room_id = this.room()!.id;
    order.guest_id = this.guest()!.id;
    try {
      await this.orderService.placeOrder(order);
      await this.fetchOrders();
      this.closeDrinkModal();
      this.navigate('orders');
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  }

  private async fetchOrders() {
    if (!this.guest()) return;
    const orders = await this.orderService.getOrdersForGuest(
      this.roomCode,
      this.guest()!.id,
    );
    this.orders.set(orders);
    console.log('just set: ', this.orders());
  }

  // Helper methods for localStorage
  private getStorageKey(): string {
    return `pd-guest-${this.roomCode}`;
  }

  private saveGuestIdToStorage(guestId: string): void {
    localStorage.setItem(this.getStorageKey(), guestId);
  }

  private getGuestIdFromStorage(): string | null {
    return localStorage.getItem(this.getStorageKey());
  }

  private clearGuestIdFromStorage(): void {
    localStorage.removeItem(this.getStorageKey());
  }

  private removeGuestIdFromUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { guestId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * Updates the guest signal with the new data from the child component.
   */
  handleGuestUpdate(updatedGuest: Guest): void {
    // The updatedGuest object from the database contains the image *path*.
    // We need to convert it to a full public URL before updating the signal
    // so the <img> tag can display it.
    if (updatedGuest.profile_picture) {
      updatedGuest.profile_picture = this.storageService.getPublicImageUrl(
        updatedGuest.profile_picture,
      );
    }
    console.log('guestupdated', updatedGuest);

    this.guest.set(updatedGuest); // Now update the signal with the correct URL
  }
}
