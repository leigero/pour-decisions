import { Component, OnInit, signal, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { Room, OrderWithDetails, Drink } from '../../services/supabase/models';
import { ActivatedRoute } from '@angular/router';
import { DrinkComponent } from '../../shared/drink/drink.component';

@Component({
  selector: 'pd-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DrinkComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private readonly roomId:string;

  public readonly room = signal<Room>(undefined);  
  public readonly drinks = signal<Drink[]>([]);

  constructor(){
    this.roomId = this.route.snapshot.paramMap.get("roomId");
  }

  async ngOnInit() {
    const thisRoom = await this.supabase.getRoomById(this.roomId);
    this.room.set(thisRoom);

    const drinks = await this.supabase.getDrinks();
    this.drinks.set(drinks);

  }

}