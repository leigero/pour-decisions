import { Component, output, effect, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pd-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  public readonly close = output<void>();

  constructor(private renderer: Renderer2) {
    // Add class to body to prevent scrolling when modal is open
    this.renderer.addClass(document.body, 'modal-open');
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  ngOnDestroy() {
    // Remove class from body when modal is destroyed
    this.renderer.removeClass(document.body, 'modal-open');
  }
}
