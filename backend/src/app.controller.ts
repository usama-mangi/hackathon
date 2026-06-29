import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ArcjetGuard } from './common/guards/arcjet.guard';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller()
@UseGuards(ArcjetGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AllowAnonymous()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Get('health')
  @AllowAnonymous()
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
