import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room, Order, Guest } from '../../services/supabase/models';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyComponent } from './lobby/lobby.component';
import { MenuComponent } from './menu/menu.component';

type GuestDashboardView = 'main' | 'menu' | 'orders';

export interface OrderVM extends Order {
  drinkName: string;
}

@Component({
  selector: 'pd-room',
  standalone: true,
  imports: [CommonModule, LobbyComponent, MenuComponent],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {
  public readonly room = signal<Room>(null);

  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);

  public readonly orders = signal<OrderVM[]>([]);
  public readonly guest = signal<Guest>(undefined);

  public readonly view = signal<GuestDashboardView>('main');
  private readonly roomCode: string;
  private readonly guestId: string;

  constructor() {
    this.roomCode = this.route.snapshot.paramMap.get('roomCode');
    this.guestId = this.route.snapshot.queryParamMap.get('guestId');
    console.log('Guest Id: ', this.guestId);
  }

  async ngOnInit() {
    this.room.set(await this.supabase.getRoomByCode(this.roomCode));
    this.guest.set(await this.supabase.getGuestById(this.guestId));
    this.guest().profile_picture =
      'https://ui-avatars.com/api/?name=' + this.guest().display_name;
    const orders = await this.supabase.getOrdersForGuest(
      this.roomCode,
      this.guest().id,
    );
    console.log(orders);
    const vmOrders = orders.map((o) => ({
      ...o,
      drinkName: o.drinks.name,
    }));
    this.orders.set(vmOrders);
  }

  public navigate(view: GuestDashboardView) {
    this.view.set(view);
  }
}
