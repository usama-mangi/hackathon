import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArcjetModule } from './lib/arcjet/arcjet.module';
import { PrismaModule } from './prisma/prisma.module';
import { auth } from './lib/auth/auth';
import { UserModule } from './module/user/user.module';
import { HackathonModule } from './module/hackathon/hackathon.module';
import { SubmissionModule } from './module/submission/submission.module';
import { TeamModule } from './module/team/team.module';
import { EventModule } from './module/event/event.module';
import { AnnoucementModule } from './module/annoucement/annoucement.module';
import { TicketModule } from './module/ticket/ticket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArcjetModule,
    PrismaModule,
    AuthModule.forRoot({ auth }),
    UserModule,
    HackathonModule,
    SubmissionModule,
    TeamModule,
    EventModule,
    AnnoucementModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
