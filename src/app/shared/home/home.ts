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
    { url: 'https://res.cloudinary.com/dux4gqdow/image/upload/v1773654004/cosas-que-ver-en-segovia-espana_d16fi3.jpg', alt: 'Alcázar de Segovia' },
    // { url: 'https://images.unsplash.com/photo-1449156001533-cb39c8504913?auto=format&fit=crop&q=80', alt: 'Ciudad moderna' },
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80', alt: 'Playa tropical' },
    { url: 'https://res.cloudinary.com/dux4gqdow/image/upload/v1773654729/db023d436664aa88b2e84dc0cccdb870491b07e6-1300x865_f0e4fw.webp', alt: 'Meseta de Gizha' },
    { url: 'https://res.cloudinary.com/dux4gqdow/image/upload/v1773655371/lison-zhao-tGRCnbIsSn4-unsplash_eee4ku.jpg', alt: 'Monumento Sverd i fjell ("Espadas en la roca"), Stavenger, Noruega' },
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
