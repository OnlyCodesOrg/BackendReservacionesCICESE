import { ConflictoTipo, EstadoEquipo } from './common.types';

export interface Sala {
  id: number;
  idDepartamento: number | null;
  idTecnicoResponsable: number;
  nombreSala: string;
  ubicacion?: string | null;
  capacidadMin?: number | null;
  capacidadMax: number;
  urlImagen?: string | null;
  disponible: boolean;
  notas?: string | null;
}

export interface SalaDisponible {
  id: number;
  inicio: Date;
  fin: Date;
}

export interface disponibilidadDeSala {
  id: number;
  nombreSala: string;
  ubicacion?: string | null;
  estaDisponible: boolean;
}

export interface ConflictoHorario {
  hasConflict: boolean;
  conflictType?: ConflictoTipo;
  conflictDetails?: {
    nombreEvento: string;
    numeroReservacion: string;
    horaInicio: string;
    horaFin: string;
  };
  sugerencias?: {
    proximoHorarioDisponible?: string;
    alternativas: string[];
  };
}

export interface TipoEquipo {
  id: number;
  nombre: string;
  descripcion?: string | null;
  marca?: string | null;
  modelo?: string | null;
  año?: number | null;
}

export interface EquipoSala {
  id: number;
  idSala: number;
  idTipoEquipo: number;
  cantidad: number;
  estado: EstadoEquipo;
  numeroSerie?: string | null;
  fechaAdquisicion?: Date | null;
  ultimaRevision?: Date | null;
  notas?: string | null;
}

export interface ServicioAdicional {
  id: number;
  nombre: string;
  descripcion?: string | null;
  costo?: number | null;
}

export interface HistorialUsoSala {
  id: number;
  numeroReservacion: string;
  nombreEvento: string;
  tipoEvento: string;
  fechaEvento: Date;
  horaInicio: Date;
  horaFin: Date;
  numeroAsistentesReal?: number | null;
  responsableSala: {
    id: number;
    nombre: string;
    email: string;
  };
  fallasRegistradas?: string | null;
  equiposUsados: {
    nombre: string;
    cantidad: number;
    estado: string;
  }[];
}

export interface SalaConHistorial {
  id: number;
  nombreSala: string;
  ubicacion?: string | null;
  capacidadMax: number;
  disponible: boolean;
  totalEventos: number;
  ultimoUso?: Date | null;
}

export interface DetalleEventoSala {
  reservacion: HistorialUsoSala;
  participantes: {
    id: number;
    nombre: string;
    email: string;
  }[];
  serviciosAdicionales: {
    nombre: string;
    cantidad?: number | null;
  }[];
}
