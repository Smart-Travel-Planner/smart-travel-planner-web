import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type ButtonVariant = 'btn-create' | 'btn-delete' | 'btn-edit' | 'btn-detail';

@Component({
  selector: 'app-action-button',
  imports: [MatIconModule],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonComponent {
  variant = input.required<ButtonVariant>();
  ariaLabel = input.required<string>();
  icon = input.required<string>();
  label = input<string>('');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
}
