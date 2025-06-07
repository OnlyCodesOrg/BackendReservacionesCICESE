import { PartcipantesAdicionales as modelo } from 'generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class ParticipantesAd {
  @ApiProperty({
    description: 'Id del participante adicional',
    example: 1,
  })
  id: number;
  @ApiProperty({
    description:
      'ID de la reservación a la que pertenece el participante adicional',
    example: 123,
  })
  idReservacion: number;
  @ApiProperty({
    description: 'Nombre del participante adicional',
    example: 'Juan Pérez',
  })
  nombre: string;
  @ApiProperty({
    description: 'Email del participante adicional',
    example: 'perez@email.com',
  })
  email: string;
}
