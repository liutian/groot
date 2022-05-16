import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { isDevMode } from 'util.ts/common';

@Injectable()
export class StandardResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(isDevMode() ? 1000 * 60 * 5 : 1000 * 60),
      map(value => value === null || value === undefined ? '' : value),
      map((value) => {
        if (Array.isArray(value)) {
          return {
            code: value[0],
            message: value[1],
            data: value
          }
        }

        return {
          code: '200',
          message: 'ok',
          data: value
        }
      }),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}