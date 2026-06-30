import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';

@Module({
  imports: [PrismaModule],
  providers: [CertificateService, HackathonAuthService],
  controllers: [CertificateController],
})
export class CertificateModule {}
