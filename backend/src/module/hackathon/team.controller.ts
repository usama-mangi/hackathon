import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { TeamService } from './team.service';
import { JoinTeamDto } from './dto/join-team.dto';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post(':teamId/join')
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
  async findOne(
    @Param('id') id: string,
    @Session() session: UserSession,
  ) {
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
}
