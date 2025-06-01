import { ApiProperty } from '@nestjs/swagger';

export class ConflictDetailsDto {
  @ApiProperty({
    description: 'Nombre del evento en conflicto',
    example: 'Reunión de equipo',
  })
  nombreEvento: string;

  @ApiProperty({
    description: 'Número de reservación en conflicto',
    example: 'RES-2025-001',
  })
  numeroReservacion: string;

  @ApiProperty({
    description: 'Hora de inicio del conflicto',
    example: '10:00',
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin del conflicto',
    example: '12:00',
  })
  horaFin: string;
}

export class SugerenciasDto {
  @ApiProperty({
    description: 'Próximo horario disponible',
    example: '14:00 - 16:00',
    required: false,
  })
  proximoHorarioDisponible?: string;

  @ApiProperty({
    description: 'Lista de horarios alternativos disponibles',
    example: ['08:00 - 10:00', '14:00 - 18:00'],
    type: [String],
  })
  alternativas: string[];
}

export class ConflictoHorarioDto {
  @ApiProperty({
    description: 'Indica si hay conflicto de horario',
    example: false,
  })
  hasConflict: boolean;

  @ApiProperty({
    description: 'Tipo de conflicto',
    example: 'reserva_existente',
    required: false,
  })
  conflictType?: string;

  @ApiProperty({
    description: 'Detalles del conflicto',
    type: ConflictDetailsDto,
    required: false,
  })
  conflictDetails?: ConflictDetailsDto;

  @ApiProperty({
    description: 'Sugerencias de horarios alternativos',
    type: SugerenciasDto,
    required: false,
  })
  sugerencias?: SugerenciasDto;
}

export class ValidarDisponibilidadResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Horario disponible',
  })
  message: string;

  @ApiProperty({
    description: 'Información del conflicto de horario',
    type: ConflictoHorarioDto,
  })
  conflict: ConflictoHorarioDto;
}
