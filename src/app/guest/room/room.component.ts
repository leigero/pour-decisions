import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room, Order, Guest, Drink } from '../../services/supabase/models';
import {
  OrderService,
  RoomService,
  StorageService,
} from '../../services/supabase';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyComponent } from './lobby/lobby.component';
import { MenuComponent } from './menu/menu.component';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { OrderVM } from '../../shared/models/vm.models';
import { RealtimeChannel } from '@supabase/supabase-js';
import { OrderDetailsModalComponent } from '../../shared/modals/order-details-modal/order-details-modal.component';
import { JoinRoomModalComponent } from '../../shared/modals/join-room-modal/join-room-modal.component';
import { ModalComponent } from '../../shared/modals/modal.component';
import { EditProfileModalComponent } from './edit-profile-modal/edit-profile-modal.component';
import { DrinkDetailsComponent } from '../../shared/drink/drink-details/drink-details.component';
import { RoomHeader } from './room-header/room-header';

type GuestDashboardView = 'menu' | 'orders';

@Component({
  selector: 'pd-room',
  standalone: true,
  imports: [
    CommonModule,
    LobbyComponent,
    MenuComponent,
    FormsModule,
    OrderDetailsModalComponent,
    JoinRoomModalComponent,
    ModalComponent,
    DrinkDetailsComponent,
    RoomHeader,
  ], // Add FormsModule here
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy {
  public readonly room = signal<Room | null>(null);
  public readonly guest = signal<Guest | undefined>(undefined);
  public readonly orders = signal<OrderVM[]>([]);

  private router = inject(Router);
  private orderService = inject(OrderService);
  private roomService = inject(RoomService);
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);

  public readonly view = signal<GuestDashboardView>('menu');
  private roomCode: string;
  private guestId: string | null;

  // Signals for the "Guest Gate" Modal
  public readonly showJoinModal = signal(false);

  // Signal for order detail view modal
  public readonly selectedOrder = signal<OrderVM | null>(null);
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

  private pageFocusHandler = this.handlePageFocus.bind(this);

  async ngOnInit() {
    const room = await this.roomService.getRoomByCode(this.roomCode);
    if (!room) {
      this.router.navigate(['/']);
      return;
    }
    this.room.set(room);

    // Prioritize guestId from URL, then from local storage.
    const guestIdFromUrl = this.route.snapshot.queryParamMap.get('guestId');
    const savedGuestId = this.getGuestIdFromStorage();

    const guestIdToLoad = guestIdFromUrl || savedGuestId;

    if (guestIdToLoad) {
      this.guestId = guestIdToLoad;
      this.updateUrlWithGuestId(this.guestId); // Ensure URL is consistent
      await this.loadGuestData(this.guestId);
    } else {
      // If no guest found anywhere, show the modal
      this.showJoinModal.set(true);
    }

    document.addEventListener('visibilitychange', this.pageFocusHandler);
    window.addEventListener('pageshow', this.pageFocusHandler);
  }

  ngOnDestroy(): void {
    if (this.orderSubscription) {
      this.orderService.removeSubscription(this.orderSubscription);
    }
    document.removeEventListener('visibilitychange', this.pageFocusHandler);
    window.removeEventListener('pageshow', this.pageFocusHandler);
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

  public viewOrderDetails(order: OrderVM): void {
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
        this.saveGuestIdToStorage(this.guestId); // --- NEW: Save to localStorage ---
        this.updateUrlWithGuestId(this.guestId);
        await this.loadGuestData(this.guestId);
        this.showJoinModal.set(false);
      }
    } catch (error) {
      console.error('Failed to create guest:', error);
    }
  }

  private async loadGuestData(guestId: string) {
    console.log('loading guest data ', guestId);
    this.guest.set(await this.roomService.getGuestById(guestId));
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

  public async orderDrink(drinkId: string) {
    if (!this.room() || !this.guest()) return;
    try {
      await this.orderService.placeOrder(
        drinkId,
        this.room()!.id,
        this.guest()!.id,
      );
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
    const vmOrders: OrderVM[] = orders.map((o: any) => ({
      id: o.id,
      guest_id: o.guest_id,
      room_id: o.room_id,
      status: o.status,
      created_at: o.created_at,
      drink: o.drinks, // Assign the nested object to the 'drink' property
    }));
    this.orders.set(vmOrders);
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

  private updateUrlWithGuestId(guestId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { guestId: guestId },
      queryParamsHandling: 'merge',
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
