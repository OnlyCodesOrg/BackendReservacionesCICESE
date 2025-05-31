export type EstadoSolicitud =
  | 'Pendiente'
  | 'Aprobada'
  | 'Rechazada'
  | 'Cancelada'; // Esto es un ejemplo, ajustar según los requerimientos.

export type TipoRecurrencia = 'Unica' | 'Diaria' | 'Semanal' | 'Mensual';

export type ConflictoTipo = 'reserva_existente' | 'bloqueo_sala';
