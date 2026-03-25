import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Slide } from '../../core/models/carrusel.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);

  slides = signal<Slide[]>([
    { url: 'Montanasmajestuosas.jpg', alt: 'Montañas majestuosas' },
    { url: 'AlcazardeSegovia.jpg', alt: 'Alcázar de Segovia' },
    { url: 'Tokio.jpg', alt: 'Tokio' },
    { url: 'Playatropical.jpg', alt: 'Playa tropical' },
    { url: 'MesetadeGizha.jpg', alt: 'Meseta de Gizha' },
    { url: 'MonumentoSverdifjell.jpg', alt: 'Monumento Sverd i fjell ("Espadas en la roca"), Stavenger, Noruega'},
  ]);

  currentIndex = signal<number>(0);
  private intervalId: any;

  transformOffset = computed(() => `translateX(-${(this.currentIndex() * 100) / this.slides().length}%)`);

  ngOnInit(): void {
    this.warmUpServer();
    this.startAutoPlay();
  };

  ngDestroy(): void {
    this.stopAutoPlay();
  };

  private warmUpServer(): void {
    this.http.get(`${environment.apiUrl}/health`).subscribe({
      error: () => {} // silencioso — no importa si falla
    });
  }

  startAutoPlay(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  };

  stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    };
  };

  goToSlide(index: number): void {
    this.currentIndex.set(index);
  };

  nextSlide() {
    this.currentIndex.update((index) => (index + 1) % this.slides().length);
  };
};
