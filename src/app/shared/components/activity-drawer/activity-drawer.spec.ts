import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDrawer } from './activity-drawer';

describe('ActivityDrawer', () => {
  let component: ActivityDrawer;
  let fixture: ComponentFixture<ActivityDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityDrawer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityDrawer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
