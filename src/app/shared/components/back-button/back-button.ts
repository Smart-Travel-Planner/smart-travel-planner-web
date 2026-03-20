import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './back-button.html'
})
export class BackButtonComponent {
  label = input<string>('Volver');
  topClass = input<string>('top-16');
  backClick = output<void>();

  onClick() {
    this.backClick.emit();
  };
};
