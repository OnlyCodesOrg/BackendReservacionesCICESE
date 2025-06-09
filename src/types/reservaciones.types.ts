import { EstadoSolicitud, TipoRecurrencia, TipoEvento } from './common.types';

export interface Reservacion {
  id: number;
  numeroReservacion: string;
  idUsuario: number;
  idTecnicoAsignado?: number | null;
  idSala: number;
  nombreEvento: string;
  tipoEvento: TipoEvento;
  fechaEvento: Date;
  horaInicio: Date;
  horaFin: Date;
  numeroAsistentesEstimado: number;
  numeroAsistentesReal?: number | null;
  estadoSolicitud: EstadoSolicitud;
  tipoRecurrencia: TipoRecurrencia;
  fechaFinRecurrencia?: Date | null;
  observaciones?: string | null;
  fechaCreacionSolicitud: Date;
  fechaUltimaModificacion?: Date | null;
  idUsuarioUltimaModificacion?: number | null;
  linkReunionOnline?: string | null;
  fallasRegistradas?: string | null;
}

export interface ParticipanteAdicional {
  id: number;
  idReservacion: number;
  nombre: string;
  email: string;
}

export interface ReservacionEquipoSolicitado {
  idReservacion: number;
  idTipoEquipo: number;
  cantidad: number;
  notas?: string | null;
}

export interface ReservacionServicioSolicitado {
  idReservacion: number;
  idServicioAdicional: number;
  cantidad?: number | null;
  notas?: string | null;
}

export interface FechaBloqueada {
  id: number;
  fecha: Date;
  motivo: string;
  idUsuarioCreador: number;
  activo: boolean;
}

export interface HistorialReservacion {
  id: number;
  idReservacion: number;
  accionRealizada: string;
  idUsuario: number;
  fechaAccion: Date;
  detalles?: string | null;
}

export interface SolicitudAprobacion {
  id: number;
  numeroReservacion: string;
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: Date;
  horaInicio: Date;
  horaFin: Date;
  solicitante: {
    nombre: string;
    email: string;
    departamento: string;
  };
  sala: {
    nombre: string;
    ubicacion: string;
  };
  departamentoResponsable: {
    id: number;
    nombre: string;
  };
  observaciones?: string;
}

export interface AccionAprobacion {
  numeroReservacion: string;
  accion: 'aprobar' | 'rechazar';
  motivo?: string;
  idUsuarioAprobador: number;
}
