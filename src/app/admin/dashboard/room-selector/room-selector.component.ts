import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../../supabase/models';

@Component({
  selector: 'pd-room-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-selector.component.html',
  styleUrls: ['./room-selector.component.scss']
})
export class RoomSelectorComponent {
  public readonly rooms = input<Room[]>();
  public readonly selectedRoomId = input<string | null>();
  public readonly roomSelected = output<string>();

  selectRoom(id: string | null) {
    console.log("selectRoom method", id);
    if(id){
        this.roomSelected.emit(id as string);
    }
  }
}