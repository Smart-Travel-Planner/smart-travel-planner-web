import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivitiesService } from './activities.service';
import { Activity } from '../models/activity.model';
import { ActivityCategory } from '../enums/activity-category.enum';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let httpMock: HttpTestingController;

  const mockActivity: Activity = {
    id: '1',
    trip_id: 'trip1',
    title: 'Visita al museo',
    start_time: '2025-06-01T10:00:00',
    cost: 15,
    category: ActivityCategory.Cultura,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ActivitiesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get activities by trip', () => {
    service.getActivitiesByTrip('trip1').subscribe(activities => {
      expect(activities.length).toBe(1);
      expect(activities[0].title).toBe('Visita al museo');
    });

    const req = httpMock.expectOne(req => req.url.includes('/activities/trip/trip1'));
    expect(req.request.method).toBe('GET');
    req.flush([mockActivity]);
  });

  it('should get activity by id', () => {
    service.getActivityById('1').subscribe(activity => {
      expect(activity.id).toBe('1');
    });

    const req = httpMock.expectOne(req => req.url.includes('/activities/1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockActivity);
  });

  it('should create an activity', () => {
    const newActivity = {
      title: 'Visita al museo',
      trip_id: 'trip1',
      start_time: '2025-06-01T10:00:00',
      cost: 15,
      category: ActivityCategory.Cultura,
    };

    service.createActivity(newActivity).subscribe(activity => {
      expect(activity.title).toBe('Visita al museo');
    });

    const req = httpMock.expectOne(req => req.url.includes('/activities'));
    expect(req.request.method).toBe('POST');
    req.flush(mockActivity);
  });

  it('should update an activity', () => {
    service.updateActivity('1', { title: 'Visita al museo actualizada' }).subscribe(activity => {
      expect(activity.title).toBe('Visita al museo actualizada');
    });

    const req = httpMock.expectOne(req => req.url.includes('/activities/1'));
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockActivity, title: 'Visita al museo actualizada' });
  });

  it('should delete an activity', () => {
    service.deleteActivity('1').subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(req => req.url.includes('/activities/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
