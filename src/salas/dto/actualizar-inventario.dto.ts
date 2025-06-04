import { ApiProperty } from '@nestjs/swagger';
import { EstadoEquipo } from '../../types/common.types';

export class ActualizarElementoInventarioDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  cantidad: number;

  @ApiProperty({
    enum: ['Operativo', 'NoOperativo', 'EnMantenimiento', 'Dañado'],
  })
  estado: EstadoEquipo;
}

export class ElementoInventarioDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  cantidad: number;

  @ApiProperty()
  estado: string;
}

export class ActualizarInventarioSalaDto {
  @ApiProperty({ required: false })
  idSala?: number;

  @ApiProperty({ type: [ActualizarElementoInventarioDto] })
  elementos: ActualizarElementoInventarioDto[];
}

export class ActualizarInventarioResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  sala: {
    id: number;
    nombreSala: string;
    ubicacion?: string;
  };
}
