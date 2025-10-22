import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TonicModal } from '@pour-decisions/tonic/fundamentals';

export interface CreateRoomPayload {
  name: string;
  description: string;
}

@Component({
  selector: 'pd-create-room-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TonicModal],
  templateUrl: './create-room-modal.component.html',
})
export class CreateRoomModalComponent {
  public readonly createRoom = output<CreateRoomPayload>();
  public readonly closeModal = output<void>();

  public readonly newRoomName = signal('');
  public readonly newRoomDescription = signal('');

  public onCreateClick(): void {
    this.createRoom.emit({
      name: this.newRoomName(),
      description: this.newRoomDescription(),
    });
  }
}
