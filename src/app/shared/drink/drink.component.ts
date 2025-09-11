import { Component, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { Drink } from '../../services/supabase/models';


@Component({
  selector: 'pd-drink',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './drink.component.html',
  styleUrls: ['./drink.component.scss'],
})
export class DrinkComponent implements OnInit {
    private supabase = inject(SupabaseService);

    public readonly drink = input.required<Drink>();

    ngOnInit(): void {

    }
}