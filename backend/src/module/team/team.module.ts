import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { SubmissionModule } from '../submission/submission.module';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [SubmissionModule, TicketModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
