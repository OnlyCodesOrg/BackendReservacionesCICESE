import { ApiProperty } from '@nestjs/swagger';

export class listarSalas {
  @ApiProperty({ description: "Dia del evento", example: "2025-06-20" })
  fecha: string
  
  @ApiProperty({ description: 'Hora de inicio', example: "10:00" })
  horaInicio: string;
  
  @ApiProperty({ description: 'Hora de fin', example: "15:00" })
  horaFin: string;
  
  @ApiProperty({ description: 'Array de id de salas', example: [1, 2, 3, 4] })
  salasSeleccionadas: number[];
}
