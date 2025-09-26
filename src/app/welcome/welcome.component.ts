import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase/supabase.service';
import {
  CreateRoomModalComponent,
  CreateRoomPayload,
} from '../shared/modals/create-room-modal/create-room-modal.component';

@Component({
  selector: 'pd-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateRoomModalComponent],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  private router = inject(Router);
  private supabase = inject(SupabaseService);

  readonly roomCode = signal<string>('');
  readonly guestName = signal<string>('');

  showCreateRoomModal = signal(false);

  protected onRoomCodeUpdate(roomCode: string) {
    this.roomCode.set(roomCode);
  }

  protected async joinRoom() {
    const roomCode = this.roomCode();
    const guestName = this.guestName();
    if (!roomCode || !guestName) {
      return;
    }
    const guest = await this.supabase.joinRoom(roomCode, guestName);
    this.router.navigate(['/room', roomCode], {
      queryParams: { guestId: guest.id },
    });
  }

  /*
        CREATE ROOM ACTIONS
    */
  protected openCreateRoomModal() {
    this.showCreateRoomModal.set(true);
  }

  protected closeCreateRoomModal() {
    this.showCreateRoomModal.set(false);
  }

  protected async createRoom(payload: CreateRoomPayload) {
    const room = await this.supabase.createRoom(
      payload.name,
      payload.description,
    );
    if (room) {
      this.closeCreateRoomModal();
      this.router.navigate(['/dashboard', room.id]);
    }
  }
}
