import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';
import { Observable, finalize } from 'rxjs';

export const loadingInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const _loadingService = inject(LoadingService);
  _loadingService.show();

  return next(request).pipe(finalize(() => _loadingService.hide()));
};
