export type EstadoSolicitud =
  | 'Pendiente'
  | 'Aprobada'
  | 'Rechazada'
  | 'Cancelada';

export type TipoEvento =
  | 'Reunion'
  | 'Videoconferencia'
  | 'Presentacion'
  | 'Capacitacion'
  | 'Conferencia'
  | 'Otro';

export type TipoRecurrencia = 'Unica' | 'Diaria' | 'Semanal' | 'Mensual';

export type EstadoEquipo =
  | 'Operativo'
  | 'NoOperativo'
  | 'EnMantenimiento'
  | 'Dañado';

export type DiaSemana =
  | 'Lunes'
  | 'Martes'
  | 'Miercoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sabado'
  | 'Domingo';

export type ConflictoTipo = 'reserva_existente' | 'bloqueo_sala';
