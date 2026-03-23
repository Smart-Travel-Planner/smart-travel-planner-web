import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripRequirementsDialog } from './trip-requirements-dialog';

describe('TripRequirementsDialog', () => {
  let component: TripRequirementsDialog;
  let fixture: ComponentFixture<TripRequirementsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripRequirementsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripRequirementsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
