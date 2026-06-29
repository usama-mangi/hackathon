import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';

@Module({
  controllers: [TicketController],
  providers: [TicketService, HackathonAuthService],
  exports: [TicketService],
})
export class TicketModule {}

