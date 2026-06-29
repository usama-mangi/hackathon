import { Controller } from '@nestjs/common';
import { AnnoucementService } from './annoucement.service';

@Controller('annoucement')
export class AnnoucementController {
  constructor(private readonly annoucementService: AnnoucementService) {}
}
