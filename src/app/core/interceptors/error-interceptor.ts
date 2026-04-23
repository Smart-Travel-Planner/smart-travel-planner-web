import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          notificationService.showAuthError();
          break;
        case 403:
          notificationService.showError('No tienes permisos para realizar esta acción.');
          break;
        case 404:
          notificationService.showError('No se encontró el recurso solicitado');
          break;
        case 500:
          notificationService.showError(
            'Error interno del servidor. Inténtalo de nuevo más tarde.',
          );
          break;
        case 0:
          notificationService.showError('Sin conexión. Comprueba tu conexión a internet.');
          break;
        default:
          notificationService.showError('Ha ocurrido un error inesperado. Inténtalo de nuevo.');
      }
      return throwError(() => error);
    }),
  );
};
