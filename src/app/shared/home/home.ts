import { Component, computed, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Slide } from '../../core/models/carrusel.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  slides = signal<Slide[]>([
    { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80', alt: 'Montañas majestuosas' },
    { url: 'https://picsum.photos/id/10/1920/1080', alt: 'Ciudad moderna' },
    // { url: 'https://images.unsplash.com/photo-1449156001533-cb39c8504913?auto=format&fit=crop&q=80', alt: 'Ciudad moderna' },
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80', alt: 'Playa tropical' },
    { url: 'https://picsum.photos/id/28/1920/1080', alt: 'Aventura en el bosque' }
    // { url: 'https://images.unsplash.com/photo-1500835595327-8113711b062b?auto=format&fit=crop&q=80', alt: 'Aventura en el bosque' }
  ]);

  currentIndex = signal<number>(0);
  private intervalId: any;

  transformOffset = computed(() => `translateX(-${(this.currentIndex() * 100) / this.slides().length}%)`);

  ngOnInit(): void {
    this.startAutoPlay();
  };

  ngDestroy(): void {
    this.stopAutoPlay();
  };

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
