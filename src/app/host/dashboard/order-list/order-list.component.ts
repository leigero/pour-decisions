import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderWithDetails } from '@pour-decisions/services/supabase';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent {
  public orders = input.required<OrderWithDetails[]>();
  public select = output<OrderWithDetails>();
}
