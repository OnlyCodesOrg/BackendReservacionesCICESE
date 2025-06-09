import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class FindReservacionesByDateDto {
  @ApiProperty({
    description: 'Fecha de inicio para filtrar las reservaciones (YYYY-MM-DD)',
    example: '2024-03-20',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiProperty({
    description: 'Fecha de fin para filtrar las reservaciones (YYYY-MM-DD)',
    example: '2024-03-25',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}
