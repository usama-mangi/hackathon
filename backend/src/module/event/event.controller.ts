import { Controller, Put, Delete, Body, Param } from '@nestjs/common';
import { EventService } from './event.service';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Put(':id')
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Event updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Session() session: UserSession,
  ) {
    return this.eventService.updateEvent(
      id,
      updateEventDto,
      session.user.id,
      session.user.role as string,
    );
  }

  @Delete(':id')
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Event deleted successfully')
  async remove(@Param('id') id: string, @Session() session: UserSession) {
    return this.eventService.deleteEvent(
      id,
      session.user.id,
      session.user.role as string,
    );
  }
}
