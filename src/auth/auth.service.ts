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
  private refreshTokens: Map<number, string> = new Map();

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
      include: {
        rol: true,
        departamento: true,
      },
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
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      idRol: user.id_rol,
      nombre: user.nombre,
      apellidos: user.apellidos,
      id_departamento: user.id_departamento,
    };

    // Generar access token y refresh token
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Guardar el refresh token
    this.refreshTokens.set(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        rol: user.rol,
        departamento: user.departamento,
      },
    };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const storedRefreshToken = this.refreshTokens.get(userId);

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.usuarios.findUnique({
      where: { id: userId },
      include: {
        rol: true,
        departamento: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      idRol: user.id_rol,
      nombre: user.nombre,
      apellidos: user.apellidos,
      id_departamento: user.id_departamento,
    };

    const access_token = this.jwtService.sign(payload);
    const new_refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Actualizar el refresh token
    this.refreshTokens.set(user.id, new_refresh_token);

    return {
      access_token,
      refresh_token: new_refresh_token,
    };
  }

  async logout(userId: number) {
    this.refreshTokens.delete(userId);
    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
    };
  }
}
