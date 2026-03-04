import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationListComponent } from './location-list';

describe('LocationList', () => {
  let component: LocationListComponent;
  let fixture: ComponentFixture<LocationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
