import { ApiProperty } from '@nestjs/swagger';

export class ResponsableSalaDto {
  @ApiProperty({ description: 'ID del responsable' })
  id: number;

  @ApiProperty({ description: 'Nombre del responsable' })
  nombre: string;

  @ApiProperty({ description: 'Email del responsable' })
  email: string;
}

export class EquipoUsadoDto {
  @ApiProperty({ description: 'Nombre del equipo' })
  nombre: string;

  @ApiProperty({ description: 'Cantidad utilizada' })
  cantidad: number;

  @ApiProperty({ description: 'Estado del equipo' })
  estado: string;
}

export class HistorialUsoSalaDto {
  @ApiProperty({ description: 'ID de la reservación' })
  id: number;

  @ApiProperty({ description: 'Número de reservación' })
  numeroReservacion: string;

  @ApiProperty({ description: 'Nombre del evento' })
  nombreEvento: string;

  @ApiProperty({ description: 'Tipo de evento' })
  tipoEvento: string;

  @ApiProperty({ description: 'Fecha del evento' })
  fechaEvento: Date;

  @ApiProperty({ description: 'Hora de inicio del evento' })
  horaInicio: Date;

  @ApiProperty({ description: 'Hora de fin del evento' })
  horaFin: Date;

  @ApiProperty({ description: 'Número real de asistentes', nullable: true })
  numeroAsistentesReal?: number | null;

  @ApiProperty({ description: 'Información del responsable de la sala' })
  responsableSala: ResponsableSalaDto;

  @ApiProperty({
    description: 'Fallas registradas durante el evento',
    nullable: true,
  })
  fallasRegistradas?: string | null;

  @ApiProperty({
    description: 'Lista de equipos utilizados en el evento',
    type: [EquipoUsadoDto],
  })
  equiposUsados: EquipoUsadoDto[];
}

export class HistorialUsoSalaResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo del resultado' })
  message: string;

  @ApiProperty({
    description: 'Historial de uso de la sala',
    type: [HistorialUsoSalaDto],
  })
  data: HistorialUsoSalaDto[];
}
