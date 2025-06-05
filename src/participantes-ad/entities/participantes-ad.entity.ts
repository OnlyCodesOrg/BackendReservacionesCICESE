import { PartcipantesAdicionales as modelo } from 'generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class ParticipantesAd {
  id: number;
  idReservacion: number;
  nombre: string;
  email: string;
}
