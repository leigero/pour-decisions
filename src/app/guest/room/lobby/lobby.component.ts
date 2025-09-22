import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Order, Room } from '../../../services/supabase/models';
import { OrderVM } from '../../../shared/models/vm.models';

@Component({
  selector: 'pd-lobby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
  public readonly room = input.required<Room>();
  public readonly orders = input.required<OrderVM[]>();

  public openMenu = output();
  public viewOrder = output<OrderVM>();
}
