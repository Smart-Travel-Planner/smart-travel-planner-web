import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationDialogComponent } from './location-dialog';

describe('LocationDialog', () => {
  let component: LocationDialogComponent;
  let fixture: ComponentFixture<LocationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
