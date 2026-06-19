import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: {
    context: ExecutionContext;
    limit: number;
    ttl: number;
    throttler: any;
    blockDuration: number;
    getTracker: (req: any, context: ExecutionContext) => string | Promise<string>;
    generateKey: (context: ExecutionContext, suffix: string, name: string) => string;
  }): Promise<boolean> {
    const { context } = requestProps;
    const req = context.switchToHttp().getRequest();

    if (req.originalUrl?.includes('/auth/login')) {
      requestProps.limit = 10;
    } else if (req.user) {
      requestProps.limit = 300;
    } else {
      requestProps.limit = 100;
    }

    return super.handleRequest(requestProps);
  }
}
