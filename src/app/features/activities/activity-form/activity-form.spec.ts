import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityFormComponent } from './activity-form';

describe('ActivityForm', () => {
  let component: ActivityFormComponent;
  let fixture: ComponentFixture<ActivityFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
