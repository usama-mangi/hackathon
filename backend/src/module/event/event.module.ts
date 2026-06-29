import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';

@Module({
  controllers: [EventController],
  providers: [EventService, HackathonAuthService],
  exports: [EventService],
})
export class EventModule {}

