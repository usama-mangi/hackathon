import { Controller, Put, Delete, Body, Param } from '@nestjs/common';
import { EventService } from './event.service';
import { Roles } from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Put(':id')
  @Roles(['ADMIN'])
  @ResponseMessage('Event updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(id, updateEventDto);
  }

  @Delete(':id')
  @Roles(['ADMIN'])
  @ResponseMessage('Event deleted successfully')
  async remove(@Param('id') id: string) {
    return this.eventService.deleteEvent(id);
  }
}
