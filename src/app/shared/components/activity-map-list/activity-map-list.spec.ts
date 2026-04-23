import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityMapListComponent } from './activity-map-list';

describe('ActivityMapList', () => {
  let component: ActivityMapListComponent;
  let fixture: ComponentFixture<ActivityMapListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityMapListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityMapListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
