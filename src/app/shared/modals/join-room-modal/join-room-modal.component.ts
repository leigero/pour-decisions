import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'pd-join-room-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join-room-modal.component.html',
  styleUrls: ['./join-room-modal.component.scss'],
})
export class JoinRoomModalComponent {
  // INPUT: The name of the room to display
  public readonly roomName = input.required<string>();

  // OUTPUT: Emits the guest's name when they want to join
  public readonly joinRoom = output<string>();

  // INTERNAL STATE: The name the user types into the input field
  public readonly guestName = signal('');
}
