import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room, Order, Guest } from '../../services/supabase/models';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyComponent } from './lobby/lobby.component';
import { MenuComponent } from './menu/menu.component';
import { FormsModule } from '@angular/forms'; // Import FormsModule

type GuestDashboardView = 'main' | 'menu' | 'orders';

export interface OrderVM extends Order {
  drinkName: string;
}

@Component({
  selector: 'pd-room',
  standalone: true,
  imports: [CommonModule, LobbyComponent, MenuComponent, FormsModule], // Add FormsModule here
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {
  public readonly room = signal<Room | null>(null);
  public readonly guest = signal<Guest | undefined>(undefined);
  public readonly orders = signal<OrderVM[]>([]);

  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);

  public readonly view = signal<GuestDashboardView>('main');
  private roomCode: string;
  private guestId: string | null;

  // Signals for the "Guest Gate" Modal
  public readonly showJoinModal = signal(false);
  public readonly newGuestName = signal('');

  constructor() {
    this.roomCode = this.route.snapshot.paramMap.get('roomCode')!;
    this.guestId = this.route.snapshot.queryParamMap.get('guestId');
  }

  async ngOnInit() {
    const room = await this.supabase.getRoomByCode(this.roomCode);
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
      // If no saved guest, but guestId is in the URL (from welcome page)
      await this.loadGuestData(this.guestId);
    } else {
      // If no guest found anywhere, show the modal
      this.showJoinModal.set(true);
    }
  }

  public async handleJoinRoom() {
    const guestName = this.newGuestName();
    if (!guestName || !this.room()) return;

    try {
      const newGuest = await this.supabase.joinRoom(this.roomCode, guestName);
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
    this.guest.set(await this.supabase.getGuestById(guestId));
    if (this.guest()) {
      // Save guest to storage in case they came from welcome page
      this.saveGuestIdToStorage(guestId);
      this.guest()!.profile_picture =
        'https://ui-avatars.com/api/?name=' + this.guest()!.display_name;
      await this.fetchOrders();
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
      await this.supabase.placeOrder(
        drinkId,
        this.room()!.id,
        this.guest()!.id,
      );
      await this.fetchOrders();
      this.navigate('main');
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  }

  private async fetchOrders() {
    if (!this.guest()) return;
    const orders = await this.supabase.getOrdersForGuest(
      this.roomCode,
      this.guest()!.id,
    );
    const vmOrders = orders.map((o) => ({
      ...o,
      drinkName: o.drinks.name,
    }));
    this.orders.set(vmOrders);
  }

  // --- NEW: Helper methods for localStorage ---
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
