import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, HackathonAuthService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
