import { Component, OnInit, signal, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupabaseService } from '../../services/supabase/supabase.service';
import { Room, OrderWithDetails } from '../../services/supabase/models';

import { OrderListComponent } from './order-list/order-list.component';
import { GuestStatsComponent } from './guest-stats/guest-stats.component';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'pd-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    OrderListComponent,
    GuestStatsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private readonly roomId:string;

  public readonly room = signal<Room>(undefined);  


  constructor(){
    this.roomId = this.route.snapshot.paramMap.get("roomId");
  }

  async ngOnInit() {
    const thisRoom = await this.supabase.getRoomById(this.roomId);
    this.room.set(thisRoom);
  }

}