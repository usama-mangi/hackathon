import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';

@Module({
  controllers: [SubmissionController],
  providers: [SubmissionService, HackathonAuthService],
  exports: [SubmissionService],
})
export class SubmissionModule {}

