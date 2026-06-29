import { IsString, IsNotEmpty } from 'class-validator';

export class JoinTeamDto {
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}
