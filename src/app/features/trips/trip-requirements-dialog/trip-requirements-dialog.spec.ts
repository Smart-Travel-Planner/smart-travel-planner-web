import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelRequirementsDialogComponent } from './trip-requirements-dialog';

describe('TripRequirementsDialog', () => {
  let component: TravelRequirementsDialogComponent;
  let fixture: ComponentFixture<TravelRequirementsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelRequirementsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelRequirementsDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
