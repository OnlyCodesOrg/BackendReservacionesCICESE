import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  id: number;

  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Correo del usuario',
  })
  email: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ example: 'Pérez López', description: 'Apellidos del usuario' })
  apellidos: string;

  @ApiProperty({ example: 1, description: 'ID del rol del usuario' })
  idRol: number;

  @ApiProperty({
    example: 1,
    description: 'ID del departamento',
    nullable: true,
  })
  id_departamento: number | null;
}

export class AuthTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT para autenticación',
  })
  access_token: string;
}

class UserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  nombre: string;

  @ApiProperty({ example: 'Doe' })
  apellidos: string;

  @ApiProperty({ example: { id: 1, nombre: 'Administrador' } })
  rol: {
    id: number;
    nombre: string;
  };

  @ApiProperty({ example: { id: 1, nombre: 'Departamento TI' } })
  departamento?: {
    id: number;
    nombre: string;
  } | null;
}

export class AuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Has iniciado sesión correctamente.' })
  message: string;

  @ApiProperty({
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 1,
        email: 'john.doe@example.com',
        nombre: 'John',
        apellidos: 'Doe',
        rol: {
          id: 1,
          nombre: 'Administrador',
        },
        departamento: {
          id: 1,
          nombre: 'Departamento TI',
        },
      },
    },
  })
  data: {
    access_token: string;
    refresh_token: string;
    user: UserDto;
  };
}

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'ID del usuario' })
  userId: number;

  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Correo del usuario',
  })
  email: string;

  @ApiProperty({ example: 1, description: 'ID del rol del usuario' })
  idRol: number;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ example: 'Pérez López', description: 'Apellidos del usuario' })
  apellidos: string;

  @ApiProperty({
    example: 1,
    description: 'ID del departamento',
    nullable: true,
  })
  id_departamento: number | null;
}

export class ProfileResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Perfil obtenido exitosamente' })
  message: string;

  @ApiProperty({
    example: {
      sub: 1,
      email: 'john.doe@example.com',
      idRol: 1,
      nombre: 'John',
      apellidos: 'Doe',
      id_departamento: 1,
    },
  })
  data: {
    sub: number;
    email: string;
    idRol: number;
    nombre: string;
    apellidos: string;
    id_departamento?: number | null;
  };
}
