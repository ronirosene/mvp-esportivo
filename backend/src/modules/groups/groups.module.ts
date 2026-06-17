import { Module } from '@nestjs/common';
import { GroupsController, GroupParticipantsController } from './controllers/groups.controller';
import { GroupsService } from './services/groups.service';

@Module({
  controllers: [GroupsController, GroupParticipantsController],
  providers: [GroupsService],
})
export class GroupsModule {}
