import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'tn-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly mainLinks = [
    { label: 'Foundations', path: '/foundations', exact: true },
    { label: 'Components', path: '/components' },
    { label: 'Forms', path: '/forms' },
  ];

  protected readonly themes = [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'Modern', value: 'modern' },
  ];

  protected currentTheme = 'dark';

  protected trackByPath(_: number, link: { path: string }): string {
    return link.path;
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('tonic-docs-theme');
    this.setTheme(saved || this.currentTheme, false);
  }

  protected setTheme(theme: string, persist = true): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) localStorage.setItem('tonic-docs-theme', theme);
  }
}
