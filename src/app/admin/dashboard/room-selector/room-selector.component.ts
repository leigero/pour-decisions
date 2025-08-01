import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../../supabase/models';

@Component({
  selector: 'app-room-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-selector.component.html',
  styleUrls: ['./room-selector.component.scss']
})
export class RoomSelectorComponent {
  @Input() rooms: Room[] = [];
  @Input() selectedRoomId: string | null = null;
  @Output() roomSelected = new EventEmitter<string>();

  selectRoom(id: string | null) {
    if(!id){
        this.roomSelected.emit(id as string);
    }
    
  }
}