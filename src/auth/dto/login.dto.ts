//src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo no tiene un formato válido.' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  contraseña: string;
}

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}