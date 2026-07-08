import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import {
  AllowAnonymous,
  Roles,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { HackathonService } from './hackathon.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { TeamService } from '../team/team.service';
import { CreateTeamDto } from '../team/dto/create-team.dto';
import { SubmissionService } from '../submission/submission.service';
import { EventService } from '../event/event.service';
import { CreateEventDto } from '../event/dto/create-event.dto';
import { AnnoucementService } from '../annoucement/annoucement.service';
import { CreateAnnouncementDto } from '../annoucement/dto/create-announcement.dto';
import { TicketService } from '../ticket/ticket.service';

@Controller('hackathon')
export class HackathonController {
  constructor(
    private readonly hackathonService: HackathonService,
    private readonly teamService: TeamService,
    private readonly submissionService: SubmissionService,
    private readonly eventService: EventService,
    private readonly annoucementService: AnnoucementService,
    private readonly ticketService: TicketService,
  ) {}

  @Post()
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Hackathon created successfully')
  async create(
    @Body() createHackathonDto: CreateHackathonDto,
    @Session() session: UserSession,
  ) {
    return this.hackathonService.create(createHackathonDto, session.user.id);
  }

  @Get()
  @AllowAnonymous()
  async findAll() {
    return this.hackathonService.findAll();
  }

  @Get('me/joined')
  @ResponseMessage('Joined hackathons retrieved successfully')
  async findJoined(@Session() session: UserSession) {
    return this.hackathonService.findJoined(session.user.id);
  }

  @Get(':id')
  @AllowAnonymous()
  async findOne(@Param('id') id: string) {
    return this.hackathonService.findOne(id);
  }

  @Get(':id/me/role')
  @ResponseMessage('Hackathon role context retrieved')
  async getMyRole(@Param('id') id: string, @Session() session: UserSession) {
    return this.hackathonService.getMyRole(
      id,
      session.user.id,
      session.user.role as string,
    );
  }

  @Put(':id')
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Hackathon updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateHackathonDto: UpdateHackathonDto,
    @Session() session: UserSession,
  ) {
    return this.hackathonService.update(
      id,
      updateHackathonDto,
      session.user.id,
      session.user.role as string,
    );
  }

  @Delete(':id')
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Hackathon deleted successfully')
  async remove(@Param('id') id: string, @Session() session: UserSession) {
    return this.hackathonService.remove(
      id,
      session.user.id,
      session.user.role as string,
    );
  }

  @Post(':id/join')
  @ResponseMessage('Successfully joined the hackathon')
  async join(@Param('id') id: string, @Session() session: UserSession) {
    return this.hackathonService.join(id, session.user.id);
  }

  @Post(':id/teams')
  @ResponseMessage('Team created successfully')
  async createTeam(
    @Param('id') id: string,
    @Body() createTeamDto: CreateTeamDto,
    @Session() session: UserSession,
  ) {
    return this.teamService.createTeam(id, session.user.id, createTeamDto);
  }

  @Get(':id/teams')
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Hackathon teams retrieved successfully')
  async getTeams(@Param('id') id: string) {
    return this.teamService.findTeamsByHackathon(id);
  }

  @Get(':id/submissions')
  @AllowAnonymous()
  @ResponseMessage('Hackathon submissions retrieved successfully')
  async getSubmissions(@Param('id') id: string) {
    return this.submissionService.findSubmissionsByHackathon(id);
  }

  @Post(':id/events')
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Event added successfully')
  async createEvent(
    @Param('id') id: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventService.createEvent(id, createEventDto);
  }

  @Get(':id/events')
  @AllowAnonymous()
  @ResponseMessage('Hackathon events retrieved successfully')
  async getEvents(@Param('id') id: string) {
    return this.eventService.getEventsByHackathon(id);
  }

  @Get(':id/results')
  @AllowAnonymous()
  @ResponseMessage('Leaderboard retrieved successfully')
  async getResults(@Param('id') id: string) {
    return this.hackathonService.getResults(id);
  }

  @Post(':id/announcements')
  @Roles(['ADMIN', 'ORGANIZER'])
  @ResponseMessage('Announcement created successfully')
  async createAnnouncement(
    @Param('id') id: string,
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ) {
    return this.annoucementService.createAnnouncement(id, createAnnouncementDto);
  }

  @Get(':id/announcements')
  @AllowAnonymous()
  @ResponseMessage('Hackathon announcements retrieved successfully')
  async getAnnouncements(@Param('id') id: string) {
    return this.annoucementService.getAnnouncementsByHackathon(id);
  }

  @Get(':id/tickets')
  @Roles(['ADMIN', 'ORGANIZER', 'PARTICIPANT'])
  @ResponseMessage('Open tickets retrieved successfully')
  async getTickets(@Param('id') id: string, @Session() session: UserSession) {
    return this.ticketService.getTicketsByHackathon(
      id,
      session.user.id,
      session.user.role as string,
    );
  }
}
