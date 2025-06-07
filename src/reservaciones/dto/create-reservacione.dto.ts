// src/reservaciones/dto/create-reservacione.dto.ts

import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Matches,
} from 'class-validator';

// Lista de valores permitidos para tipoEvento (según tu enum en Prisma)
const TIPOS_EVENTO = [
  'Reunion',
  'Videoconferencia',
  'Presentacion',
  'Capacitacion',
  'Conferencia',
  'Otro',
] as const;

export class CreateReservacioneDto {
  @IsString()
  numeroReservacion: string;
  // Puede ser un UUID o cualquier formato que tú decidas,
  // por ejemplo "RES-20250601-0001". Ajusta la validación si quieres requisitos adicionales.

  @IsInt()
  idUsuario: number;
  // El ID del usuario que hace la reservación. Lo tomas del JWT en el front.

  @IsInt()
  idTecnicoAsignado: number;

  @IsString()
  nombreEvento: string;
  // El título/nombre que ponga el usuario para su evento.

  @IsInt()
  idSala: number;

  @IsInt()
  @IsString()
  @IsIn(TIPOS_EVENTO, {
    message: `tipoEvento debe ser uno de: ${TIPOS_EVENTO.join(', ')}`,
  })
  tipoEvento: string;

  @IsDateString()
  fechaEvento: string; // ISO string ("2025-06-05") proveniente del front

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'horaInicio debe tener el formato HH:mm',
  })
  horaInicio: string; // ej. "09:00"

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'horaFin debe tener el formato HH:mm',
  })
  horaFin: string; // ej. "11:30"

  @IsInt()
  @Min(0)
  asistentes: number; // número estimado de asistentes

  @IsOptional()
  @IsString()
  observaciones?: string;
}
