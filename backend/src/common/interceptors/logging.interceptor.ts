import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();
    const requestId = request['requestId'] || '-';

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const duration = Date.now() - now;
        const userId = request.user?.id || '-';
        const organizationId = request.user?.organizationId || '-';

        this.logger.log(
          `[${requestId}] ${method} ${url} ${statusCode} ${duration}ms user=${userId} org=${organizationId}`,
        );
      }),
    );
  }
}
