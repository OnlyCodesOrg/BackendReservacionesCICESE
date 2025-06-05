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

  @ApiProperty({
    type: UserInfoDto,
    description: 'Información del usuario',
  })
  user: UserInfoDto;
}

export class AuthResponseDto {
  @ApiProperty({ example: true, description: 'Estado de la operación' })
  success: boolean;

  @ApiProperty({
    example: 'Has iniciado sesión correctamente.',
    description: 'Mensaje descriptivo',
  })
  message: string;

  @ApiProperty({
    type: AuthTokenDto,
    description: 'Datos del token de acceso y usuario',
  })
  data: AuthTokenDto;
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
  @ApiProperty({ example: true, description: 'Estado de la operación' })
  status: boolean;

  @ApiProperty({
    example: 'Perfil obtenido exitosamente',
    description: 'Mensaje descriptivo',
  })
  message: string;

  @ApiProperty({
    type: UserProfileDto,
    description: 'Datos del perfil del usuario',
  })
  data: UserProfileDto;
}
