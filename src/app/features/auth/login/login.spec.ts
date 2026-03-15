import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LoginComponent } from './login';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should call login with form values on submit', () => {
    (authServiceMock.login as ReturnType<typeof vi.fn>).mockReturnValue(
      of({ access_token: 'fake-token' })
    );

    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '123456',
    });
  });

  it('should show error message on login failure', () => {
    (authServiceMock.login as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('error'))
    );

    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Credenciales incorrectas');
  });
});
