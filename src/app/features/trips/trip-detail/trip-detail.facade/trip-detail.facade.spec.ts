import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripDetailFacade } from './trip-detail.facade';

describe('TripDetailFacade', () => {
  let component: TripDetailFacade;
  let fixture: ComponentFixture<TripDetailFacade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripDetailFacade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripDetailFacade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
