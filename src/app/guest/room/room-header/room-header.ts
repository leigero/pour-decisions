import { Component, input, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Guest, Room } from '@pour-decisions/supabase';

import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

@Component({
  selector: 'pd-room-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,    
    EditProfileModalComponent,
  ],
  templateUrl: './room-header.html',
  styleUrls: ['./room-header.scss'],
})
export class RoomHeader {
  public readonly guest = input.required<Guest>();
  public readonly room = input.required<Room>();

  @Output() guestUpdated = new EventEmitter<Guest>();

  public readonly copyButtonText = signal('Share');
  private readonly isSharing = signal(false);

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

  /**
   * Handles sharing the room invite link.
   * Uses the Web Share API if available, otherwise copies to clipboard.
   */
  public copyInviteLink(): void {
    // Prevent multiple share dialogs from opening at once.
    if (this.isSharing()) return;

    const roomCode = this.room()?.code;
    if (!roomCode) return;

    const guestUrl = `${window.location.origin}/room/${roomCode}`;
    const shareData = {
      title: 'Join my Pour Decisions room!',
      text: `Join my Pour Decisions room with code: ${roomCode}`,
      url: guestUrl,
    };

    if (navigator.share) {
      this.isSharing.set(true);
      navigator
        .share(shareData)
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        })
        .finally(() => {
          this.isSharing.set(false);
        });
    } else {
      navigator.clipboard.writeText(guestUrl).then(() => {
        this.copyButtonText.set('Copied!');
        setTimeout(() => this.copyButtonText.set('Share'), 2000);
      });
    }
  }
}
