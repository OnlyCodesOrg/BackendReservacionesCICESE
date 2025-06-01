export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  contraseña: string;
  id_rol: number;
  id_departamento: number | null;
  activo: boolean;
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Tecnico {
  id: number;
  idUsuario: number;
  especialidad?: string | null;
  activo: boolean;
}

export interface DisponibilidadTecnico {
  id: number;
  idTecnico: number;
  diaSemana: string;
  horaInicio: Date;
  horaFin: Date;
  activo: boolean;
}
