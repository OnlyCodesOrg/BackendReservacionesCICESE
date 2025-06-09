import { PartialType } from '@nestjs/mapped-types';
import { CreateReservacioneDto } from './create-reservacione.dto';

import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Matches,
} from 'class-validator';
import {
  EstadoSolicitudReservacion,
  TipoEvento,
  TipoRecurrencia,
} from 'generated/prisma';
import { EstadoSolicitud } from 'src/types';
export class UpdateReservacioneDto extends PartialType(CreateReservacioneDto) {
  estadoSolicitud?: EstadoSolicitudReservacion;
  numeroAsistentes?: number;
  fechaFin?: Date;
  numeroAsistentesReal?: number;
  tipoRecurrencia?: TipoRecurrencia;
  fechaFinRecurrencia?: string;
  linkReunion?: string;
  idUsuarioUltimaModificacion?: number;
  fallasRegistradas?: string;
}
