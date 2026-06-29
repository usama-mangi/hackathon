import { Module } from '@nestjs/common';
import { HackathonService } from './hackathon.service';
import { HackathonController } from './hackathon.controller';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  controllers: [HackathonController, TeamController],
  providers: [HackathonService, TeamService],
})
export class HackathonModule {}
