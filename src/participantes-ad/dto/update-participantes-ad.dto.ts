import { PartialType } from '@nestjs/mapped-types';
import { CreateParticipantesAdDto } from './create-participantes-ad.dto';

export class UpdateParticipantesAdDto extends PartialType(
  CreateParticipantesAdDto,
) {}
