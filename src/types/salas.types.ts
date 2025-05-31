import { ConflictoTipo } from './common.types';

export interface Sala {
  id: number;
  idDepartamento: number;
  idTecnicoResponsable: number;
  nombreSala: string;
  ubicacion?: string;
  capacidadMin?: number;
  capacidadMax: number;
  urlImagen?: string;
  disponible: boolean;
  notas?: string;
}

export interface SalaDisponible {
  id: number;
  inicio: Date;
  fin: Date;
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
