/* eslint-disable @typescript-eslint/require-await */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

export type JwtPayload = {
  sub: number;
  email: string;
  idRol: number;
  nombre: string;
  apellidos: string;
  id_departamento?: number | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    // Validate input parameters
    if (!email || !pass) {
      return null;
    }

    const user = await this.prisma.usuarios.findUnique({
      where: { email },
    });

    if (!user || !user.contraseña) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.contraseña);

    if (!isMatch) {
      return null;
    }

    // Si las credenciales son válidas, devolvemos el usuario sin la contraseña
    const { contraseña, ...result } = user;
    return result;
  }

  async login(user: any) {
    // user comes from LocalStrategy validation, so it's already validated
    if (!user) {
      return {
        success: false,
        message: 'Credenciales inválidas',
        data: null,
      };
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      idRol: user.id_rol,
      nombre: user.nombre,
      apellidos: user.apellidos,
      id_departamento: user.id_departamento,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
