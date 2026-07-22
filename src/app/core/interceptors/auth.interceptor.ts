import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs'; // Add catchError and throwError
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router); // Inject Router
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Handle errors for authenticated requests
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        // If token is expired (401) or invalid (403), log the user out
        if (error.status === 401 || error.status === 403) {
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};