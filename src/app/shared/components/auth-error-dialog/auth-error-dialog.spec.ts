import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthErrorDialogComponent } from './auth-error-dialog';

describe('AuthErrorDialog', () => {
  let component: AuthErrorDialogComponent;
  let fixture: ComponentFixture<AuthErrorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthErrorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthErrorDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
