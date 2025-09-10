import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room, Drink } from '../../services/supabase/models';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pd-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit{
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private readonly roomCode: string;
  public readonly room = signal<Room>(undefined);
  public readonly drinks = signal<Drink[]>([]);
  
  constructor(){
    this.roomCode = this.route.snapshot.paramMap.get("roomCode")
  }

  async ngOnInit() {
    const thisRoom = await this.supabase.getRoomByCode(this.roomCode);
    this.room.set(thisRoom);

    // const drinks = await this.supabase.getDrinks();
    // this.drinks.set(drinks);
  }
  
  addDrink(){
    const newDrink : Drink = {
      id: "a0ed7634-ce23-4b97-87c7-b58b99315251",
      name: "Bee's Knees",
      description: "Gin Honey and Lemon",
      image_url: "https://d3gqasl9vmjfd8.cloudfront.net/6da703b3-a022-4606-80d6-3e7dd200a4c0.png",
      room_id: this.room().id,
    };
    
    this.drinks.set([...this.drinks(),newDrink]);
   
    // const drinks = this.supabase.addDrink("Manhattan", ["Rye Whisky", "Sweet Vermouth", "Angastura Bitters"], "3b4e66fb-7d36-4ecf-884e-527fb41bb134");
  }

  /*
   async onSelectRoom(roomId: string) {
    this.selectedRoomId.set(roomId);
    const orders = await this.supabase.getOrdersForRoom(roomId);
    this.orders.set(orders);
  }
    */
}

