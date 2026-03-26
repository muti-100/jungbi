import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

/**
 * Ensures every request has an X-Request-ID header (generated if absent)
 * and echoes it back in the response.
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId =
      (request.headers['x-request-id'] as string) ?? uuidv4();

    request.headers['x-request-id'] = requestId;
    response.setHeader('X-Request-ID', requestId);

    return next.handle();
  }
}
