import { Controller, Param, Put } from '@nestjs/common';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { TicketService } from './ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Put(':id/claim')
  @Roles(['ADMIN'])
  @ResponseMessage('Ticket claimed successfully')
  async claim(
    @Param('id') ticketId: string,
    @Session() session: UserSession,
  ) {
    return this.ticketService.claimTicket(ticketId, session.user.id);
  }

  @Put(':id/resolve')
  @ResponseMessage('Ticket resolved successfully')
  async resolve(
    @Param('id') ticketId: string,
    @Session() session: UserSession,
  ) {
    const isAdmin = session.user.role === 'ADMIN';
    return this.ticketService.resolveTicket(ticketId, session.user.id, isAdmin);
  }
}
