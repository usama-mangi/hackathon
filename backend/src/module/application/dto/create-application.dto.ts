import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateApplicationDto {
  @IsEnum(['MENTOR', 'JUDGE'], { message: "roleType must be 'MENTOR' or 'JUDGE'" })
  roleType: 'MENTOR' | 'JUDGE';

  // ── Common fields ─────────────────────────────────────────────────────────

  @IsString()
  @IsNotEmpty()
  @MinLength(30, { message: 'Bio must be at least 30 characters' })
  @MaxLength(500)
  bio: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Motivation must be at least 50 characters' })
  @MaxLength(1000)
  motivation: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Experience must be at least 50 characters' })
  @MaxLength(1000)
  experience: string;

  // ── Mentor-specific fields ────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  @MaxLength(300)
  skills?: string; // e.g. "React, Node.js, Pitch Coaching"

  @IsOptional()
  @IsUrl({}, { message: 'linkedinUrl must be a valid URL' })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'githubUrl must be a valid URL' })
  githubUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  availability?: string; // e.g. "Full day Saturday, Sunday morning"

  // ── Judge-specific fields ─────────────────────────────────────────────────

  @IsOptional()
  @IsString()
  @MaxLength(300)
  expertiseArea?: string; // e.g. "AI/ML, Hardware, Web3"

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  priorJudgingExp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  conflictStatement?: string; // Conflict of interest declaration
}
