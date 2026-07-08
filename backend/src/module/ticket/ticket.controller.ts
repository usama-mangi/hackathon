import { Controller, Get, Param, Put } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { TicketService } from './ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get(':id')
  @ResponseMessage('Ticket retrieved successfully')
  async findOne(@Param('id') ticketId: string) {
    return this.ticketService.findOne(ticketId);
  }

  @Put(':id/claim')
  @ResponseMessage('Ticket claimed successfully')
  async claim(
    @Param('id') ticketId: string,
    @Session() session: UserSession,
  ) {
    return this.ticketService.claimTicket(
      ticketId,
      session.user.id,
      session.user.role as string,
    );
  }

  @Put(':id/resolve')
  @ResponseMessage('Ticket resolved successfully')
  async resolve(
    @Param('id') ticketId: string,
    @Session() session: UserSession,
  ) {
    return this.ticketService.resolveTicket(
      ticketId,
      session.user.id,
      session.user.role as string,
    );
  }
}
