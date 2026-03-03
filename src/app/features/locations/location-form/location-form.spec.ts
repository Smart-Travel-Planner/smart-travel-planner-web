import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationFormComponent } from './location-form';

describe('LocationForm', () => {
  let component: LocationFormComponent;
  let fixture: ComponentFixture<LocationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
