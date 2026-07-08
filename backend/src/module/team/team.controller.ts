import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { TeamService } from './team.service';
import { JoinTeamDto } from './dto/join-team.dto';
import { SubmissionService } from '../submission/submission.service';
import { CreateSubmissionDto } from '../submission/dto/create-submission.dto';
import { UpdateSubmissionDto } from '../submission/dto/update-submission.dto';
import { TicketService } from '../ticket/ticket.service';
import { CreateTicketDto } from '../ticket/dto/create-ticket.dto';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly submissionService: SubmissionService,
    private readonly ticketService: TicketService,
  ) {}

  @Post(':id/join')
  @ResponseMessage('Successfully joined the team')
  async join(
    @Param('teamId') teamId: string,
    @Body() joinTeamDto: JoinTeamDto,
    @Session() session: UserSession,
  ) {
    return this.teamService.joinTeam(teamId, session.user.id, joinTeamDto);
  }

  @Get(':id')
  @ResponseMessage('Team details retrieved successfully')
  async findOne(@Param('id') id: string, @Session() session: UserSession) {
    return this.teamService.findTeamById(id, session.user.id);
  }

  @Delete(':teamId/members/:userId')
  @ResponseMessage('Team member removed successfully')
  async removeMember(
    @Param('teamId') teamId: string,
    @Param('userId') memberUserId: string,
    @Session() session: UserSession,
  ) {
    return this.teamService.removeMember(teamId, session.user.id, memberUserId);
  }

  @Post(':id/submission')
  @ResponseMessage('Submission created successfully')
  async createSubmission(
    @Param('id') teamId: string,
    @Body() createSubmissionDto: CreateSubmissionDto,
    @Session() session: UserSession,
  ) {
    return this.submissionService.create(
      teamId,
      session.user.id,
      createSubmissionDto,
    );
  }

  @Put(':id/submission')
  @ResponseMessage('Submission updated successfully')
  async updateSubmission(
    @Param('id') teamId: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @Session() session: UserSession,
  ) {
    return this.submissionService.update(
      teamId,
      session.user.id,
      updateSubmissionDto,
    );
  }

  @Post(':id/tickets')
  @ResponseMessage('Help request submitted successfully')
  async requestHelp(
    @Param('id') teamId: string,
    @Body() createTicketDto: CreateTicketDto,
    @Session() session: UserSession,
  ) {
    return this.ticketService.createTicket(teamId, session.user.id, createTicketDto);
  }
}
