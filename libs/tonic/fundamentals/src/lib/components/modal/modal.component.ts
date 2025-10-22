import {
  Component,
  ElementRef,
  OnDestroy,
  effect,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'tonic-modal',
  standalone: true,
  template: `
    <dialog
      #dialog      
      (click)="onDialogClick($event)"
      (close)="onDialogClosed()"
    >
      
        <ng-content></ng-content>
      
    </dialog>
  `,
  styles: [
    `
      :host {
        display: contents; /* let dialog control layout */
      }
    `,
  ],
})
export class TonicModal implements OnDestroy {
  public readonly close = output<void>();

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>(
    'dialog',
  );

  constructor() {
    // Open the dialog after it's in the DOM
    queueMicrotask(() => {
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;
      try {
        if (!dialog.open) dialog.showModal();
        document.body.classList.add('modal-open');
      } catch (e) {
        // In non-browser environments, just no-op
      }
    });
  }

  // Clicking the backdrop area (the dialog itself, not its child panel) closes
  onDialogClick(event: MouseEvent): void {
    const dialogEl = this.dialogRef()?.nativeElement;
    if (!dialogEl) return;
    if (event.target === dialogEl) {
      dialogEl.close();
    }
  }

  // Normalize all close paths to a single output and cleanup
  onDialogClosed(): void {
    this.close.emit();
    document.body.classList.remove('modal-open');
  }

  ngOnDestroy(): void {
    const dialog = this.dialogRef()?.nativeElement;
    try {
      if (dialog?.open) dialog.close();
    } catch {}
    document.body.classList.remove('modal-open');
  }
}

