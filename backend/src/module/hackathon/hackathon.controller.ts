import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

@Controller('hackathon')
export class HackathonController {
  constructor(
    private readonly hackathonService: HackathonService,
    private readonly teamService: TeamService,
    private readonly submissionService: SubmissionService,
    private readonly eventService: EventService,
    private readonly annoucementService: AnnoucementService,
  ) {}

  @Post()
  @Roles(['ADMIN'])
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

  @Get(':id')
  @AllowAnonymous()
  async findOne(@Param('id') id: string) {
    return this.hackathonService.findOne(id);
  }

  @Patch(':id')
  @Roles(['ADMIN'])
  @ResponseMessage('Hackathon updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateHackathonDto: UpdateHackathonDto,
  ) {
    return this.hackathonService.update(id, updateHackathonDto);
  }

  @Delete(':id')
  @Roles(['ADMIN'])
  @ResponseMessage('Hackathon deleted successfully')
  async remove(@Param('id') id: string) {
    return this.hackathonService.remove(id);
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
  @Roles(['ADMIN'])
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
  @Roles(['ADMIN'])
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
  @Roles(['ADMIN'])
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
}
