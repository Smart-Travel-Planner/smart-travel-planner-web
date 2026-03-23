import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripExplorerComponent } from './trip-explorer';

describe('TripExplorer', () => {
  let component: TripExplorerComponent;
  let fixture: ComponentFixture<TripExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripExplorerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripExplorerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
