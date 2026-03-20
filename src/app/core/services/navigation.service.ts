import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private previousUrl = signal<string>('/trips');

  setPreviousUrl(url: string): void {
    this.previousUrl.set(url);
  }

  getPreviousUrl(): string {
    return this.previousUrl();
  }
}
