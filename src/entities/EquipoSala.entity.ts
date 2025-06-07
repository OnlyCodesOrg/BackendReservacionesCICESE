import { EstadoEquipo } from 'src/types/common.types';

export class EquipoSala {
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
