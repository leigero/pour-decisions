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
import { OrderService, RoomService } from '../../services/supabase';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyComponent } from './lobby/lobby.component';
import { MenuComponent } from './menu/menu.component';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { OrderVM } from '../../shared/models/vm.models';
import { RealtimeChannel } from '@supabase/supabase-js';
import { OrderDetailsModalComponent } from '../../shared/modals/order-details-modal/order-details-modal.component';
import { JoinRoomModalComponent } from '../../shared/modals/join-room-modal/join-room-modal.component';
import { ModalComponent } from '../../shared/modals/modal.component';
import { DrinkDetailsComponent } from '../../shared/drink/drink-details/drink-details.component';

type GuestDashboardView = 'main' | 'menu' | 'orders';

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
  private route = inject(ActivatedRoute);

  public readonly view = signal<GuestDashboardView>('main');
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
      // Update URL just in case it was missing the guestId
      this.updateUrlWithGuestId(this.guestId);
      await this.loadGuestData(this.guestId);
    } else if (this.guestId) {
      console.log('guestID from URL', this.guestId);
      // If no saved guest, but guestId is in the URL (from welcome page)
      await this.loadGuestData(this.guestId);
    } else {
      // If no guest found anywhere, show the modal
      this.showJoinModal.set(true);
    }
  }

  ngOnDestroy(): void {
    if (this.orderSubscription) {
      this.orderService.removeSubscription(this.orderSubscription);
    }
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
    if (this.guest()) {
      // Save guest to storage in case they came from welcome page
      this.saveGuestIdToStorage(guestId);
      this.guest()!.profile_picture =
        'https://ui-avatars.com/api/?name=' + this.guest()!.display_name;
      await this.fetchOrders();
      // After fetching initial orders, set up the real-time subscription
      this.orderSubscription = this.orderService.onGuestOrderChanges(
        guestId,
        (payload) => {
          console.log('Guest order update received!', payload);

          // Since we only listen for UPDATES, we can process the payload directly.
          const updatedOrder = payload.new as Order;
          this.orders.update((currentOrders) =>
            currentOrders.map((order) =>
              order.id === updatedOrder.id
                ? { ...order, status: updatedOrder.status } // Update status
                : order,
            ),
          );
        },
      );
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
      this.navigate('main');
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
}
