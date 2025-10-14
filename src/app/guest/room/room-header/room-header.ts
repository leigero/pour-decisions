import { Component, input, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { DrinkSummaryComponent } from '../../../shared/drink/drink-summary/drink-summary.component';
import { Guest, Room } from '../../../services/supabase/models';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

@Component({
  selector: 'pd-room-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DrinkSummaryComponent,
    EditProfileModalComponent,
  ],
  templateUrl: './room-header.html',
  styleUrls: ['./room-header.scss'],
})
export class RoomHeader {
  public readonly guest = input.required<Guest>();
  public readonly room = input.required<Room>();

  @Output() guestUpdated = new EventEmitter<Guest>();

  public readonly showEditProfileModal = signal<boolean>(false);

  closeEditProfileModal() {
    this.showEditProfileModal.set(false);
  }
  openEditProfileModal() {
    this.showEditProfileModal.set(true);
  }

  /**
   * Handles the profileUpdated event from the modal,
   * closes the modal, and emits the updated guest data upwards.
   */
  handleProfileUpdate(updatedGuest: Guest): void {
    this.guestUpdated.emit(updatedGuest);
    this.closeEditProfileModal();
  }
}
