import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripExplorer } from './trip-explorer';

describe('TripExplorer', () => {
  let component: TripExplorer;
  let fixture: ComponentFixture<TripExplorer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripExplorer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripExplorer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
