import { Global, Module } from '@nestjs/common';
import { LiveGateway } from './live.gateway';
import { LiveService } from './live.service';
import { LiveController } from './live.controller';

@Global()
@Module({
  controllers: [LiveController],
  providers: [LiveGateway, LiveService],
  exports: [LiveGateway, LiveService],
})
export class LiveModule {}
