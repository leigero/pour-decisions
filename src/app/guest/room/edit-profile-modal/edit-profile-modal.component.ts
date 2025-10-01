import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { Guest } from '../../../services/supabase/models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../shared/modals/modal.component';
import { GuestService } from '../../../services/supabase/';

@Component({
  selector: 'pd-edit-profile-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalComponent],
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
})
export class EditProfileModalComponent {
  @Input() guest!: Guest;
  @Output() close = new EventEmitter<void>();

  private guestService = inject(GuestService);

  guestUpdated = signal<Guest | null>(null);

  ngOnInit() {}
  saveChanges() {
    this.guest = {
      ...this.guest,
      display_name: this.guest.display_name,
    };
    this.guestUpdated.set(this.guest);
    this.guestService.updateGuest(this.guest);
    this.close.emit();
  }
}
