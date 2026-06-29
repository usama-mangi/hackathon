import { Module } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { SubmissionModule } from '../submission/submission.module';
import { TeamModule } from '../team/team.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [SubmissionModule, TeamModule, EventModule],
  controllers: [HackathonController],
  providers: [HackathonService],
})
export class HackathonModule {}
