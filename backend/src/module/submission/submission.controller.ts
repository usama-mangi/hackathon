import { Controller, Get, Delete, Param } from '@nestjs/common';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { SubmissionService } from './submission.service';

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get(':id')
  @AllowAnonymous()
  @ResponseMessage('Submission details retrieved successfully')
  async findOne(@Param('id') id: string) {
    return this.submissionService.findOne(id);
  }

  @Delete(':id')
  @ResponseMessage('Submission deleted successfully')
  async remove(@Param('id') id: string, @Session() session: UserSession) {
    return this.submissionService.delete(id, session.user.id);
  }
}
