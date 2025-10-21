import { Component, effect, input, viewChild, ElementRef, inject, signal, OnDestroy } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'tonic-qr-code',
  standalone: true,
  template: `
    <canvas #canvas class="tonic-qr-canvas"></canvas>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        /* If no explicit height is provided by the container,
           uncomment the next line to enforce a square area by default */
        aspect-ratio: 1 / 1;
      }
      .tonic-qr-canvas {
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
        max-width: 100%;
        max-height: 100%;
        display: block;
      }
    `,
  ],
})
export class TonicQrCode implements OnDestroy {
  // Inputs
  public value = input.required<string>();
  public size = input<number>(320); // fallback size when not responsive
  public level = input<'L' | 'M' | 'Q' | 'H'>('M');
  public margin = input<number>(2);
  public responsive = input<boolean>(true);

  // Canvas reference
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  // Host element and resize tracking for responsive rendering
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef as any);
  private _resizeObs?: ResizeObserver;
  private readonly containerWidth = signal(0);
  private readonly containerHeight = signal(0);

  constructor() {
    // Setup ResizeObserver when in responsive mode
    queueMicrotask(() => {
      const el = this.hostRef?.nativeElement;
      if (!el) return;
      this._resizeObs = new ResizeObserver((entries) => {
        const cr = entries[0]?.contentRect;
        if (!cr) return;
        const w = Math.max(0, Math.floor(cr.width));
        const h = Math.max(0, Math.floor(cr.height));
        if (w !== this.containerWidth()) this.containerWidth.set(w);
        if (h !== this.containerHeight()) this.containerHeight.set(h);
      });
      this._resizeObs.observe(el);
    });
  }

  // Re-render whenever inputs change or canvas becomes available
  private readonly renderEffect = effect(() => {
    const canvasRef = this.canvasRef();
    const canvasEl = canvasRef?.nativeElement;
    const text = this.value();
    const isResponsive = this.responsive();
    const containerW = this.containerWidth();
    const containerH = this.containerHeight();
    // Choose the limiting dimension to preserve square aspect when the container isn't square
    const limiting = containerW > 0 && containerH > 0 ? Math.min(containerW, containerH) : containerW;
    const cssSize = isResponsive && limiting > 0 ? limiting : this.size();
    const dpr = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;
    const width = Math.max(1, Math.floor(cssSize * dpr));
    const level = this.level();
    const margin = this.margin();

    if (!canvasEl || !text) return;

    // Ensure the canvas scales to its container (or limiting dimension) while rendering at high DPI
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';

    QRCode.toCanvas(canvasEl, text, {
      width,
      margin,
      errorCorrectionLevel: level,
    }).catch((err) => console.error('QR render error:', err));
  });

  ngOnDestroy(): void {
    if (this._resizeObs) {
      this._resizeObs.disconnect();
      this._resizeObs = undefined;
    }
  }
}
