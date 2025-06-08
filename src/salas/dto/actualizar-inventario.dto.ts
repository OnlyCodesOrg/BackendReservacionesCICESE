import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsEnum, Min } from 'class-validator';

export enum EstadoEquipo {
  Operativo = 'Operativo',
  NoOperativo = 'NoOperativo',
  EnMantenimiento = 'EnMantenimiento',
  Dañado = 'Dañado',
}

export class ActualizarElementoInventarioDto {
  @ApiProperty({
    description:
      'Nombre del elemento del inventario (debe coincidir con un tipo de equipo existente)',
    example: 'Cámara',
    enum: [
      'Cámara',
      'Micrófono',
      'Pantalla',
      'Proyector',
      'Silla',
      'Mesa',
      'Pizarrón',
      'Plumón',
      'Borrador',
    ],
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Cantidad del elemento',
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  cantidad: number;

  @ApiProperty({
    description: 'Estado del elemento',
    example: 'Operativo',
    enum: EstadoEquipo,
  })
  @IsEnum(EstadoEquipo)
  estado: EstadoEquipo;
}

export class ActualizarInventarioSalaDto {
  @ApiProperty({
    description: 'ID de la sala',
    example: 1,
  })
  @IsInt()
  idSala: number;

  @ApiProperty({
    description: 'Lista de elementos del inventario a actualizar',
    type: [ActualizarElementoInventarioDto],
  })
  elementos: ActualizarElementoInventarioDto[];
}

export class ActualizarInventarioResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Inventario actualizado exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Información de la sala actualizada',
    example: {
      id: 1,
      nombreSala: 'Sala de Conferencias A',
    },
  })
  @IsOptional()
  sala?: {
    id: number;
    nombreSala: string;
  };
}
