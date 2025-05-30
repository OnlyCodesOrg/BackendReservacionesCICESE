export class CreateReservacioneDto {
  sala: string;
  tipoEvento: string;
  fechaEvento: Date;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
  equipo: string[];
  observaciones: string;
}
