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
  
  constructor(){
    this.roomCode = this.route.snapshot.paramMap.get("roomCode")
  }

  async ngOnInit() {
    const thisRoom = await this.supabase.getRoomByCode(this.roomCode);
    this.room.set(thisRoom);
  }
}

