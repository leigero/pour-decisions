import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('pour-decisions');
  public readonly logo = signal<string>('');
  private supabase = inject(SupabaseService);

  async ngOnInit() {
    console.log('logo getting');
    const logoUrl = await this.supabase.getImage('images/logo2.png', 200, 200);
    console.log('log image url is: ', logoUrl);
    this.logo.set(logoUrl);
  }
}
