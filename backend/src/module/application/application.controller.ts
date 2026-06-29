import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('hackathon/:hackathonId/applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ResponseMessage('Application submitted successfully')
  async submit(
    @Param('hackathonId') hackathonId: string,
    @Body() dto: CreateApplicationDto,
    @Session() session: UserSession,
  ) {
    return this.applicationService.submitApplication(
      hackathonId,
      session.user.id,
      dto,
    );
  }

  @Get()
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Applications retrieved successfully')
  async list(
    @Param('hackathonId') hackathonId: string,
    @Query('role') role: string,
    @Query('status') status: string,
    @Session() session: UserSession,
  ) {
    return this.applicationService.getApplications(
      hackathonId,
      session.user.id,
      session.user.role as string,
      { role, status },
    );
  }

  @Put(':applicationId/accept')
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Application accepted successfully')
  async accept(
    @Param('hackathonId') hackathonId: string,
    @Param('applicationId') applicationId: string,
    @Session() session: UserSession,
  ) {
    return this.applicationService.acceptApplication(
      hackathonId,
      applicationId,
      session.user.id,
      session.user.role as string,
    );
  }

  @Put(':applicationId/reject')
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Application rejected successfully')
  async reject(
    @Param('hackathonId') hackathonId: string,
    @Param('applicationId') applicationId: string,
    @Session() session: UserSession,
  ) {
    return this.applicationService.rejectApplication(
      hackathonId,
      applicationId,
      session.user.id,
      session.user.role as string,
    );
  }
}
