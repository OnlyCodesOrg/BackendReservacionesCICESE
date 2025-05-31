export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  contraseña: string;
  id_rol: number;
  id_departamento: number;
  Activo: boolean;
}

export interface Rol {
  id: number;
  nombres: string;
}

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Tecnico {
  id: number;
  idUsuario: number;
  especialidad?: string;
  Activo: boolean;
}
