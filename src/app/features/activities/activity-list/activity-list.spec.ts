import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityListComponent } from './activity-list';

describe('ActivityList', () => {
  let component: ActivityListComponent;
  let fixture: ComponentFixture<ActivityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
