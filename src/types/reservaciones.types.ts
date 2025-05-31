import { EstadoSolicitud, TipoRecurrencia } from './common.types';

export interface Reservacion {
  id: number;
  numeroReservacion: string;
  idUsuario: number;
  idTecnicoAsignado?: number;
  idSala: number;
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: Date;
  horaInicio: Date;
  horaFin: Date;
  numeroAsistentesEstimado: number;
  numeroAsistentesReal?: number;
  estadoSolicitud: EstadoSolicitud;
  tipoRecurrencia: TipoRecurrencia;
  fechaFinRecurrencia?: Date;
  observaciones?: string;
  fechaCreacionSolicitud: Date;
  fechaUltimaModificacion?: Date;
  idUsuarioUltimaModificacion?: number;
  linkReunionOnline?: string;
  fallasRegistradas?: string;
}

export interface ParticipanteAdicional {
  id: number;
  idReservacion: number;
  nombre: string;
  email: string;
}
