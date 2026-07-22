import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent], // <-- ADD IMPORTS HERE
  template: `
  @if (authService.isLoggedIn$) {

        <app-navbar></app-navbar>
}
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main { padding: 20px; }
  `]
})
export class AppComponent {
  // Expose authService so the template can use the | async pipe
  constructor(public authService: AuthService) {}
}