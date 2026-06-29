import { IsInt, Min, Max } from 'class-validator';

export class VoteSubmissionDto {
  @IsInt()
  @Min(1)
  @Max(10)
  score: number;
}
