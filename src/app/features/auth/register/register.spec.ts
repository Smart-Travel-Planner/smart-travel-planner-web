import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { RegisterComponent } from './register';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      register: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('should call register with form values on submit', () => {
    (authServiceMock.register as ReturnType<typeof vi.fn>).mockReturnValue(
      of({ id: '1', name: 'Test', email: 'test@test.com' })
    );

    component.registerForm.setValue({
      name: 'Test',
      email: 'test@test.com',
      password: '123456',
    });
    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      name: 'Test',
      email: 'test@test.com',
      password: '123456',
    });
  });

  it('should show error message on register failure', () => {
    (authServiceMock.register as ReturnType<typeof vi.fn>).mockReturnValue(
      throwError(() => new Error('error'))
    );

    component.registerForm.setValue({
      name: 'Test',
      email: 'test@test.com',
      password: '123456',
    });
    component.onSubmit();

    expect(component.errorMessage).toBe('Error al registrarse. Inténtalo de nuevo.');
  });
});
