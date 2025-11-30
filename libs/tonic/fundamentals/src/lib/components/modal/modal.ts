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
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
})
export class TonicModal implements OnDestroy {
  public readonly close = output<void>();

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>(
    'dialog',
  );
  private fallbackMode = false;

  constructor() {
    // Open the dialog after it's in the DOM
    queueMicrotask(() => {
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;
      try {
        if (typeof dialog.showModal === 'function') {
          if (!dialog.open) dialog.showModal();
        } else {
          this.enableFallback(dialog);
        }
      } catch (e) {
        this.enableFallback(dialog);
      }

      document.body.classList.add('modal-open');
    });
  }

  // Clicking the backdrop area (the dialog itself, not its child panel) closes
  onDialogClick(event: MouseEvent): void {
    const dialogEl = this.dialogRef()?.nativeElement;
    if (!dialogEl) return;
    if (event.target === dialogEl) {
      if (typeof dialogEl.close === 'function' && !this.fallbackMode) {
        dialogEl.close();
      } else {
        this.teardownFallback(dialogEl);
        this.onDialogClosed();
      }
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
      if (dialog?.open && typeof dialog.close === 'function') {
        dialog.close();
      } else if (dialog && this.fallbackMode) {
        this.teardownFallback(dialog);
        this.onDialogClosed();
      }
    } catch {}
    document.body.classList.remove('modal-open');
  }

  // Fallback for browsers without showModal (iOS < 15.4, some WebViews)
  private enableFallback(dialog: HTMLDialogElement): void {
    this.fallbackMode = true;
    dialog.setAttribute('open', 'true');
    dialog.setAttribute('data-fallback-open', 'true');
  }

  private teardownFallback(dialog: HTMLDialogElement): void {
    dialog.removeAttribute('data-fallback-open');
    dialog.removeAttribute('open');
    this.fallbackMode = false;
  }
}

