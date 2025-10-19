import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'tonic-icon',
  standalone: true,
  template: `
    <span aria-hidden="true"  [innerHTML]="svg()"></span>
  `,
  styles: [
    `
      :host {
        span {
          color: inherit;
        }
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
