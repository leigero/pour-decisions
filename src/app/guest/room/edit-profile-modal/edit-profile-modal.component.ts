import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/modals/modal.component';
import { Guest } from '../../../services/supabase/models';
import { GuestService } from '../../../services/supabase';
import { StorageService } from '../../../services/supabase/storage.service';

@Component({
  selector: 'pd-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
})
export class EditProfileModalComponent implements OnInit {
  @Input() guest!: Guest;
  @Output() close = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<Guest>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public displayName: string = '';
  public isSaving = signal(false);
  public previewUrl: string | null = null;
  private selectedFile: File | null = null;

  private guestService = inject(GuestService);
  private storageService = inject(StorageService);

  ngOnInit(): void {
    this.displayName = this.guest.display_name;
    console.log(this.isSaving());
  }

  async saveProfile(): Promise<void> {
    if (this.isSaving()) return;
    this.isSaving.set(true);
    try {
      const updates: Partial<Guest> = {};
      let needsUpdate = false;

      if (
        this.displayName.trim() &&
        this.displayName !== this.guest.display_name
      ) {
        updates.display_name = this.displayName.trim();
        needsUpdate = true;
      }

      if (this.selectedFile) {
        const newImageUrl = await this.storageService.uploadProfileImage(
          this.selectedFile,
          this.guest.id,
        );
        updates.profile_picture = newImageUrl;
        needsUpdate = true;
      }

      if (needsUpdate) {
        const updatedGuest = await this.guestService.updateGuest(
          this.guest.id,
          updates,
        );
        this.profileUpdated.emit(updatedGuest);
        this.close.emit();
      } else {
        // If no changes, just close the modal
        this.close.emit();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      // TODO: Show an error toast/message to the user
    } finally {
      this.isSaving.set(false);
    }
  }

  triggerFileInput(captureMode?: 'user' | 'environment') {
    if (captureMode) {
      this.fileInput.nativeElement.setAttribute('capture', captureMode);
    } else {
      this.fileInput.nativeElement.removeAttribute('capture');
    }
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    }
  }
}
