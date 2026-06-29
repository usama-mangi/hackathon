import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Issue description must be at least 10 characters' })
  issue: string;
}
