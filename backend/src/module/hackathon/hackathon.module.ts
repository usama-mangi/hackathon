import { Module } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { SubmissionModule } from '../submission/submission.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [SubmissionModule, TeamModule],
  controllers: [HackathonController],
  providers: [HackathonService],
})
export class HackathonModule {}
