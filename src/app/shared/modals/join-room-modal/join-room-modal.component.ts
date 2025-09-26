import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal.component';

@Component({
  selector: 'pd-join-room-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './join-room-modal.component.html',
})
export class JoinRoomModalComponent {
  // INPUT: The name of the room to display
  public readonly roomName = input.required<string>();

  // OUTPUT: Emits the guest's name when they want to join
  public readonly joinRoom = output<string>();

  // INTERNAL STATE: The name the user types into the input field
  public readonly guestName = signal('');
}
