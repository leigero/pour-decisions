import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'pd-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
    private router = inject(Router);
    readonly roomCode = signal<string>('');

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
}

