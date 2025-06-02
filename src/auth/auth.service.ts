// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

export type JwtPayload = {
  sub: number;
  email: string;
  idRol: number;
  nombre: string;
  apellidos: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.usuarios.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        contraseña: true,
        id_rol: true,
        nombre: true,
        apellidos: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Correo no encontrado.');
    }

    const isMatch = await bcrypt.compare(pass, user.contraseña);
    if (!isMatch) {
      throw new UnauthorizedException('La contraseña es incorrecta.');
    }

    // Extraemos la contraseña y devolvemos el resto
    const { contraseña, ...result } = user;
    return result; // { id, email, id_rol, nombre, apellidos }
  }

  async login(user: { id: number; email: string; id_rol: number; nombre: string; apellidos: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      idRol: user.id_rol,
      nombre: user.nombre,
      apellidos: user.apellidos,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}