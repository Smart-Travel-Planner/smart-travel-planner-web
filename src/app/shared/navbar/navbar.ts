import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  authService = inject(AuthService);
  // isAuthenticated = signal<boolean>(false);

  // this.isAuthenticated.set(authService.isLoggedIn());

  isMenuOpen = signal(false);

  onLogout() {
    this.closeMenu();
    this.authService.logout();
  }

  toggleMenu() {
    this.isMenuOpen.update((value) => !value);
    if (this.isMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    document.body.style.overflow = '';
  }
}
