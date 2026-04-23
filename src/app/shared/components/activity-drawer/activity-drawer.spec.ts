import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityDrawerComponent } from './activity-drawer';

describe('ActivityDrawer', () => {
  let component: ActivityDrawerComponent;
  let fixture: ComponentFixture<ActivityDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityDrawerComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('activity', {});
    fixture.componentRef.setInput('locations', []);
    fixture.componentRef.setInput('isOpen', true);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
