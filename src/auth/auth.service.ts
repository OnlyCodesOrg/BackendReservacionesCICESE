import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

/**
 * Servicio de autenticación que valida usuarios y genera JWT.
 * Utiliza Prisma para acceder a la base de datos y bcrypt para comparar contraseñas.
 */
export type JwtPayload = { sub: number; email: string; idRol: number };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida las credenciales: busca por correo y compara contraseña.
   * Si es correcto, devuelve el objeto del usuario (sin la contraseña).
   * Si falla, arroja UnauthorizedException.
   */
  async validateUser(email: string, pass: string) {
    const user = await this.prisma.usuarios.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        contraseña: true,
        id_rol: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Correo no encontrado.');
    }
    // Comparamos la contraseña proporcionada con la almacenada en la base de datos 
    const isMatch = await bcrypt.compare(pass, user.contraseña);
    if (!isMatch) {
      throw new UnauthorizedException('La contraseña es incorrecta.');
    }
    const { contraseña, ...result } = user;
    return result;
  }

  /**
   * Genera un JWT a partir de la info del usuario validado.
   */
  async login(user: { id: number; email: string; id_rol: number }) {
    const payload: JwtPayload = { sub: user.id, email: user.email, idRol: user.id_rol };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
