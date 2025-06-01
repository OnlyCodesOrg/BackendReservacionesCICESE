import { ApiProperty } from '@nestjs/swagger';

export class ValidarDisponibilidadDto {
  @ApiProperty({
    description: 'ID de la sala a validar',
    example: 1
  })
  idSala: number;

  @ApiProperty({
    description: 'Fecha del evento',
    example: '2025-01-20T00:00:00.000Z'
  })
  fechaEvento: Date;

  @ApiProperty({
    description: 'Hora de inicio en formato HH:MM',
    example: '09:00'
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin en formato HH:MM',
    example: '11:00'
  })
  horaFin: string;
}
