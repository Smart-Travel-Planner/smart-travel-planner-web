import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthErrorDialog } from './auth-error-dialog';

describe('AuthErrorDialog', () => {
  let component: AuthErrorDialog;
  let fixture: ComponentFixture<AuthErrorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthErrorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthErrorDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
