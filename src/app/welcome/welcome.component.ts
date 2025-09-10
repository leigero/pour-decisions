import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase/supabase.service';



@Component({
  selector: 'pd-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
    private router = inject(Router);
    private supabase = inject(SupabaseService);


    readonly roomCode = signal<string>('');
    showCreateRoomModal = signal(false);
    newRoomName = signal('');
    newRoomDescription = signal('');

    protected onRoomCodeUpdate(roomCode:string){
        this.roomCode.set(roomCode);
    }

    protected joinRoom(){
        const roomCode = this.roomCode();
        if(!roomCode){
            return;
        }
        this.router.navigate(['/room', roomCode])
    }

    /*
        CREATE ROOM ACTIONS
    */
    protected openCreateRoomModal() {
        this.showCreateRoomModal.set(true);
    } 

    protected resetModal() {
        this.showCreateRoomModal.set(false);
        this.newRoomName.set('');
        this.newRoomDescription.set('');
    }

    protected async createRoom() {
        const room = await this.supabase.createRoom(this.newRoomName(),this.newRoomDescription());
        if(room){
            this.resetModal();
            this.router.navigate(['/dashboard', room.id]);
        }
    }
}

