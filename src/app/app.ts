import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit{
  protected readonly title = signal('smart-travel-planner-web');
  private router = inject(Router);

  @ViewChild('mainContent') mainContent!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.mainContent.nativeElement.scrollTop = 0;
    });
  }}
