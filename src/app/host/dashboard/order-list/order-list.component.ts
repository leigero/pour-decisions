import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../services/supabase/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent {
  @Input() orders: Order[] = [];
  @Output() markComplete = new EventEmitter<string>();

  completeOrder(id: string) {
    this.markComplete.emit(id);
  }
}