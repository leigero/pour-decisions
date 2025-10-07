import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tn-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly mainLinks = [
    { label: 'Foundations', path: '/foundations', exact: true },
    { label: 'Components', path: '/components' },
    { label: 'Forms', path: '/forms' },
  ];

  protected trackByPath(_: number, link: { path: string }): string {
    return link.path;
  }
}
