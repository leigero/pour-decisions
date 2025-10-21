import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Room } from '../../../services/supabase/models';
import { OrderVM } from '../../../shared/models/vm.models';

@Component({
  selector: 'pd-order-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-view.html',
  styleUrls: ['./order-view.scss'],
})
export class OrderView {
  public readonly room = input.required<Room>();
  public readonly orders = input.required<OrderVM[]>();
  
  public viewOrder = output<OrderVM>();
}
