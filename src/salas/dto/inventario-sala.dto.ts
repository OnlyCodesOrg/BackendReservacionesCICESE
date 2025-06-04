import { ApiProperty } from '@nestjs/swagger';

export class InventarioItemDto {
  @ApiProperty({
    description: 'Nombre del elemento del inventario',
    example: 'Cámara',
  })
  nombre: string;

  @ApiProperty({
    description: 'Desglose de cantidades por estado',
    example: {
      Operativo: 4,
      Dañado: 1,
      NoOperativo: 0,
      EnMantenimiento: 0
    },
    type: Object
  })
  detalles: {
    Operativo?: number;
    Dañado?: number;
    NoOperativo?: number;
    EnMantenimiento?: number;
    [key: string]: number | undefined;
  };
}


export class InventarioSalaResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Inventario obtenido exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Información de la sala',
    example: {
      id: 1,
      nombreSala: 'Sala de Conferencias A',
      ubicacion: 'Edificio Principal, Piso 2',
    },
  })
  sala: {
    id: number;
    nombreSala: string;
    ubicacion?: string;
  };

  @ApiProperty({
    description: 'Lista de elementos del inventario',
    type: [InventarioItemDto],
  })
  inventario: InventarioItemDto[];
}
