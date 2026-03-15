import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save token after login', () => {
    const mockResponse = { access_token: 'fake-token' };

    service.login({ email: 'test@test.com', password: '123456' }).subscribe();

    const req = httpMock.expectOne(req => req.url.includes('/auth/login'));
    req.flush(mockResponse);

    expect(service.getToken()).toBe('fake-token');
  });

  it('should return true when user is logged in', () => {
    localStorage.setItem('access_token', 'fake-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false when user is not logged in', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should remove token on logout', () => {
    localStorage.setItem('access_token', 'fake-token');
    service.logout();
    expect(service.getToken()).toBeNull();
  });
});
