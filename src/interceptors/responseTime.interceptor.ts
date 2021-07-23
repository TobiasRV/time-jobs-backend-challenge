import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response as ExpressResponse } from 'express';

@Injectable()
@UseInterceptors(ResponseTimeInterceptor)
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const now = Date.now();
    const ResponseObj: ExpressResponse = context.switchToHttp().getResponse();
    return next
      .handle()
      .pipe(
        tap(() =>
          ResponseObj.setHeader('Response-Time', `${Date.now() - now}ms`),
        ),
      );
  }
}
