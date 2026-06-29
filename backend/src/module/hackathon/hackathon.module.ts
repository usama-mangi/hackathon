import { Module } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { SubmissionModule } from '../submission/submission.module';
import { TeamModule } from '../team/team.module';
import { EventModule } from '../event/event.module';
import { AnnoucementModule } from '../annoucement/annoucement.module';
import { TicketModule } from '../ticket/ticket.module';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';

@Module({
  imports: [SubmissionModule, TeamModule, EventModule, AnnoucementModule, TicketModule],
  controllers: [HackathonController],
  providers: [HackathonService, HackathonAuthService],
})
export class HackathonModule {}

