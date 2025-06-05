import { ParticipantesAd } from '../entities/participantes-ad.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
export class CreateParticipantesAdDto extends OmitType(ParticipantesAd, [
  'id',
]) {}
