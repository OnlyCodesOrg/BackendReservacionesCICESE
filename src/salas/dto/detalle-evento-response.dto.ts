import { ApiProperty } from '@nestjs/swagger';
import { HistorialUsoSalaDto } from './historial-uso-sala-response.dto';

export class ParticipanteDto {
  @ApiProperty({ description: 'ID del participante' })
  id: number;

  @ApiProperty({ description: 'Nombre del participante' })
  nombre: string;

  @ApiProperty({ description: 'Email del participante' })
  email: string;
}

export class ServicioAdicionalDto {
  @ApiProperty({ description: 'Nombre del servicio adicional' })
  nombre: string;

  @ApiProperty({ description: 'Cantidad del servicio', nullable: true })
  cantidad?: number | null;
}

export class DetalleEventoDto {
  @ApiProperty({ description: 'Información de la reservación' })
  reservacion: HistorialUsoSalaDto;

  @ApiProperty({
    description: 'Lista de participantes adicionales',
    type: [ParticipanteDto],
  })
  participantes: ParticipanteDto[];

  @ApiProperty({
    description: 'Lista de servicios adicionales utilizados',
    type: [ServicioAdicionalDto],
  })
  serviciosAdicionales: ServicioAdicionalDto[];
}

export class DetalleEventoResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo del resultado' })
  message: string;

  @ApiProperty({
    description: 'Detalle completo del evento',
    type: DetalleEventoDto,
    nullable: true,
  })
  data: DetalleEventoDto | null;
}
