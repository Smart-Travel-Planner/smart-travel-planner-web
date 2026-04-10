import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityMapList } from './activity-map-list';

describe('ActivityMapList', () => {
  let component: ActivityMapList;
  let fixture: ComponentFixture<ActivityMapList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityMapList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityMapList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
