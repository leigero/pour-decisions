import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'tonic-icon',
  standalone: true,
  template: `
    <span class="tonic-icon" aria-hidden="true" [innerHTML]="svg()"></span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
        color: inherit;
      }
      /* Size utility classes (standardized; not overridable via vars) */
      .tonic-icon {
        display: inline-flex;
        width: 1.25rem;   /* default: medium */
        height: 1.25rem;  /* default: medium */
      }
      :host(.small-icon) .tonic-icon { width: 1rem; height: 0.875rem; }
      :host(.medium-icon) .tonic-icon { width: 1.25rem; height: 1rem; }
      :host(.large-icon) .tonic-icon { width: 1.5rem; height: 1.25rem; }
      .tonic-icon svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
      }
    `     
  ],  
})
export class TonicIcon {
  private readonly sanitizer = inject(DomSanitizer);
  private _icon!: string;

  public icon = input.required<string>();  

  protected svg = computed(() => {
    const icon = this.icon() || this._icon;

    return this.sanitizer.bypassSecurityTrustHtml(icon);
  });
  
}
