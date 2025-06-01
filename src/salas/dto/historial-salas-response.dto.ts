import { ApiProperty } from '@nestjs/swagger';

export class SalaConHistorialDto {
  @ApiProperty({ description: 'ID de la sala' })
  id: number;

  @ApiProperty({ description: 'Nombre de la sala' })
  nombreSala: string;

  @ApiProperty({ description: 'Ubicación de la sala', nullable: true })
  ubicacion?: string | null;

  @ApiProperty({ description: 'Capacidad máxima de la sala' })
  capacidadMax: number;

  @ApiProperty({ description: 'Indica si la sala está disponible' })
  disponible: boolean;

  @ApiProperty({ description: 'Total de eventos realizados en la sala' })
  totalEventos: number;

  @ApiProperty({
    description: 'Fecha del último uso de la sala',
    nullable: true,
  })
  ultimoUso?: Date | null;
}

export class HistorialSalasResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo del resultado' })
  message: string;

  @ApiProperty({
    description: 'Lista de salas con información de historial',
    type: [SalaConHistorialDto],
  })
  data: SalaConHistorialDto[];
}
