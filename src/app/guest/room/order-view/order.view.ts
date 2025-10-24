import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderWithDetails, Room } from '@pour-decisions/supabase';

@Component({
  selector: 'pd-order-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-view.html',
  styleUrls: ['./order-view.scss'],
})
export class OrderView {
  public readonly room = input.required<Room>();
  public readonly orders = input.required<OrderWithDetails[]>();
  
  public viewOrder = output<OrderWithDetails>();
}
