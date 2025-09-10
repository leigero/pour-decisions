import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest-stats.component.html',
  styleUrls: ['./guest-stats.component.scss']
})
export class GuestStatsComponent {
  @Input() guestStats: { name: string; count: number }[] = [];
}