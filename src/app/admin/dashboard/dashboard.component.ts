import { Component, OnInit, signal, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupabaseService } from '../../supabase/supabase.service';
import { Room, OrderWithDetails } from '../../supabase/models';

import { RoomSelectorComponent } from './room-selector/room-selector.component';
import { OrderListComponent } from './order-list/order-list.component';
import { GuestStatsComponent } from './guest-stats/guest-stats.component';
import { RoomComponent } from './room/room.component';

@Component({
  selector: 'pd-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RoomSelectorComponent,
    OrderListComponent,
    GuestStatsComponent,
    RoomComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private supabase = inject(SupabaseService);

  readonly rooms = signal<Room[]>([]);
  readonly orders = signal<OrderWithDetails[]>([]);
  readonly selectedRoomId = signal<string | null>(null);

  readonly room = computed(() => {
    const rooms = this.rooms();
    const selectedRoomId = this.selectedRoomId();
    return rooms.find(r => r.id === selectedRoomId);
  });

  readonly guestStats = computed(() => {
    const counts = new Map<string, number>();
    for (const order of this.orders()) {
      if (order.status === 'complete') {
        counts.set(order.guest.name, (counts.get(order.guest.name) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  });

  async ngOnInit() {
    const { data, error } = await this.supabase.getRooms();
    if (error) console.error('Error loading rooms', error);
    this.rooms.set(data || []);
  }

  async onSelectRoom(roomId: string) {
    this.selectedRoomId.set(roomId);
    const orders = await this.supabase.getOrdersForRoom(roomId);
    this.orders.set(orders);
  }

  async markOrderComplete(orderId: string) {
    // await this.supabase.markOrderComplete(orderId);
    // const updated = this.orders().map(order =>
    //   order.id === orderId ? { ...order, status: 'complete' } : order
    // );
    // this.orders.set(updated);
  }
}