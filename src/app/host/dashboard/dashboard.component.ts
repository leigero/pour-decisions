import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { Room, OrderWithDetails, Drink } from '../../services/supabase/models';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

type DashboardView = 'main' | 'menu' | 'orders';

@Component({
  selector: 'pd-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly roomId: string;

  public readonly room = signal<Room>(undefined);
  public readonly drinks = signal<Drink[]>([]);
  public readonly view = computed(() => {});
  public readonly view2 = signal<DashboardView>('main');

  constructor() {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
  }

  async ngOnInit() {
    const thisRoom = await this.supabase.getRoomById(this.roomId);
    this.room.set(thisRoom);

    const drinks = await this.supabase.getDrinks();
    this.drinks.set(drinks);
  }

  public navigate(view: DashboardView) {
    this.view2.set(view);

    switch (view) {
      case 'main':
        this.router.navigate(['./'], { relativeTo: this.route });
        break;
      case 'menu':
        this.router.navigate(['menu-editor'], { relativeTo: this.route });
        break;
    }
  }
}
