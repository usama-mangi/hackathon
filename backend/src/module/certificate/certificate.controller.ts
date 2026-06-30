import { Controller, Get, Post, Param } from '@nestjs/common';
import {
  AllowAnonymous,
  Roles,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { CertificateService } from './certificate.service';

@Controller()
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  /**
   * POST /hackathon/:hackathonId/certificates/issue
   * Organizer / Admin — manually bulk-issue all certificates for a hackathon.
   * Idempotent: already-issued certificates are skipped.
   */
  @Post('hackathon/:hackathonId/certificates/issue')
  @Roles(['ADMIN', 'ORGANIZER'])
  issueCertificates(
    @Param('hackathonId') hackathonId: string,
    @Session() session: UserSession,
  ) {
    return this.certificateService.issueCertificates(
      hackathonId,
      session.user.id,
      session.user.role as string,
    );
  }

  /**
   * GET /certificates/verify/:certificateId
   * Public — verify a certificate by its public ID (e.g. "A1B2-C3D4-EF012345").
   * No authentication required.
   */
  @Get('certificates/verify/:certificateId')
  @AllowAnonymous()
  verifyCertificate(@Param('certificateId') certificateId: string) {
    return this.certificateService.verifyCertificate(certificateId);
  }

  /**
   * GET /certificates/me
   * Authenticated — returns all certificates belonging to the calling user.
   */
  @Get('certificates/me')
  getMyCertificates(@Session() session: UserSession) {
    return this.certificateService.getMyCertificates(session.user.id);
  }

  /**
   * GET /hackathon/:hackathonId/certificates
   * Organizer / Admin — list all certificates issued for a hackathon.
   */
  @Get('hackathon/:hackathonId/certificates')
  @Roles(['ADMIN', 'ORGANIZER'])
  getHackathonCertificates(
    @Param('hackathonId') hackathonId: string,
    @Session() session: UserSession,
  ) {
    return this.certificateService.getHackathonCertificates(
      hackathonId,
      session.user.id,
      session.user.role as string,
    );
  }
}
