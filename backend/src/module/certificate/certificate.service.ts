import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { HackathonAuthService } from '../../common/services/hackathon-auth.service';

@Injectable()
export class CertificateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hackathonAuth: HackathonAuthService,
  ) {}

  // ---------------------------------------------------------------------------
  // Certificate ID helpers
  // ---------------------------------------------------------------------------

  /**
   * Generate a public, URL-safe certificate ID.
   * Format: {first4ofHackathonId}-{chars5-8ofUserId}-{8 random hex uppercase}
   * Example: "A1B2-C3D4-EF012345"
   *
   * IDs are generated per-cert and collision-checked via the DB unique constraint.
   */
  private generateCertificateId(hackathonId: string, userId: string): string {
    const part1 = hackathonId.replace(/-/g, '').substring(0, 4).toUpperCase();
    const part2 = userId.replace(/-/g, '').substring(4, 8).toUpperCase();
    const part3 = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${part1}-${part2}-${part3}`;
  }

  // ---------------------------------------------------------------------------
  // Issue certificates (Organizer / Admin — manual trigger)
  // ---------------------------------------------------------------------------

  /**
   * Bulk-issue all certificates for a hackathon.
   * - PARTICIPANT certs for every team member (with winner placement for top-3 teams)
   * - MENTOR certs for every confirmed hackathon mentor
   * - JUDGE certs for every confirmed hackathon judge
   *
   * Idempotent — already-issued certificates are skipped, not duplicated.
   */
  async issueCertificates(
    hackathonId: string,
    userId: string,
    userRole: string,
  ) {
    await this.hackathonAuth.assertOrganizerOrAdmin(hackathonId, userId, userRole);

    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        participants: { include: { user: true } },
        mentors: { include: { user: true } },
        judges: { include: { user: true } },
        teams: {
          include: {
            members: { include: { user: true } },
            // include leader via team.leaderId (not a relation to include)
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    // -------------------------------------------------------------------------
    // Determine winner placements from leaderboard
    // -------------------------------------------------------------------------
    const submissions = await this.prisma.submission.findMany({
      where: { team: { hackathonId } },
      include: { votes: true },
    });

    // Map teamId → placement (1-indexed, top 3 only)
    const placementMap = new Map<string, number>();
    if (submissions.length > 0) {
      const ranked = submissions
        .map((s) => ({
          teamId: s.teamId,
          totalScore: s.votes.reduce((sum, v) => sum + (v.score ?? 0), 0),
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

      ranked.slice(0, 3).forEach((entry, idx) => {
        placementMap.set(entry.teamId, idx + 1);
      });
    }

    // -------------------------------------------------------------------------
    // Build a set of already-issued (hackathonId, userId, type) tuples
    // -------------------------------------------------------------------------
    const existing = await this.prisma.certificate.findMany({
      where: { hackathonId },
      select: { userId: true, type: true },
    });
    const issuedSet = new Set(existing.map((c) => `${c.userId}:${c.type}`));

    const toCreate: {
      certificateId: string;
      hackathonId: string;
      userId: string;
      recipientName: string;
      hackathonName: string;
      type: string;
      placement?: number;
    }[] = [];

    // -------------------------------------------------------------------------
    // PARTICIPANT certs — every member of every team
    // -------------------------------------------------------------------------
    for (const team of hackathon.teams) {
      const placement = placementMap.get(team.id) ?? null;

      // Collect all unique user IDs on this team (members + leader)
      const memberUserIds = new Set<string>(team.members.map((m) => m.userId));
      memberUserIds.add(team.leaderId);

      // Resolve user objects for the leader (they may not appear in members[])
      const allMemberUsers = team.members.map((m) => m.user);
      // Fetch the leader's user record if not already in members list
      if (!team.members.some((m) => m.userId === team.leaderId)) {
        const leaderUser = await this.prisma.user.findUnique({
          where: { id: team.leaderId },
        });
        if (leaderUser) allMemberUsers.push(leaderUser);
      }

      for (const user of allMemberUsers) {
        const key = `${user.id}:PARTICIPANT`;
        if (issuedSet.has(key)) continue;
        toCreate.push({
          certificateId: this.generateCertificateId(hackathonId, user.id),
          hackathonId,
          userId: user.id,
          recipientName: user.name,
          hackathonName: hackathon.name,
          type: 'PARTICIPANT',
          ...(placement ? { placement } : {}),
        });
        issuedSet.add(key); // prevent duplicates within the same batch
      }
    }

    // -------------------------------------------------------------------------
    // MENTOR certs
    // -------------------------------------------------------------------------
    for (const mentor of hackathon.mentors) {
      const key = `${mentor.userId}:MENTOR`;
      if (issuedSet.has(key)) continue;
      toCreate.push({
        certificateId: this.generateCertificateId(hackathonId, mentor.userId),
        hackathonId,
        userId: mentor.userId,
        recipientName: mentor.user.name,
        hackathonName: hackathon.name,
        type: 'MENTOR',
      });
      issuedSet.add(key);
    }

    // -------------------------------------------------------------------------
    // JUDGE certs
    // -------------------------------------------------------------------------
    for (const judge of hackathon.judges) {
      const key = `${judge.userId}:JUDGE`;
      if (issuedSet.has(key)) continue;
      toCreate.push({
        certificateId: this.generateCertificateId(hackathonId, judge.userId),
        hackathonId,
        userId: judge.userId,
        recipientName: judge.user.name,
        hackathonName: hackathon.name,
        type: 'JUDGE',
      });
      issuedSet.add(key);
    }

    // -------------------------------------------------------------------------
    // Bulk create — one DB round-trip
    // -------------------------------------------------------------------------
    if (toCreate.length > 0) {
      await this.prisma.certificate.createMany({ data: toCreate });
    }

    const allCerts = await this.prisma.certificate.findMany({
      where: { hackathonId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { issuedAt: 'asc' },
    });

    return {
      issued: toCreate.length,
      skipped: existing.length,
      certificates: allCerts,
    };
  }

  // ---------------------------------------------------------------------------
  // Verify a certificate (Public)
  // ---------------------------------------------------------------------------

  /**
   * Lookup a certificate by its public certificateId.
   * No authentication required — this powers the public verification page.
   */
  async verifyCertificate(certificateId: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        hackathon: { select: { id: true, name: true, startsAt: true, endsAt: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!cert) {
      throw new NotFoundException(
        `Certificate with ID "${certificateId}" not found. Please check the ID and try again.`,
      );
    }

    return cert;
  }

  // ---------------------------------------------------------------------------
  // My certificates (Authenticated)
  // ---------------------------------------------------------------------------

  /** Return all certificates belonging to the calling user. */
  async getMyCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        hackathon: { select: { id: true, name: true, startsAt: true, endsAt: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------------------
  // All certificates for a hackathon (Organizer / Admin)
  // ---------------------------------------------------------------------------

  async getHackathonCertificates(
    hackathonId: string,
    userId: string,
    userRole: string,
  ) {
    await this.hackathonAuth.assertOrganizerOrAdmin(hackathonId, userId, userRole);

    return this.prisma.certificate.findMany({
      where: { hackathonId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ type: 'asc' }, { issuedAt: 'asc' }],
    });
  }
}
