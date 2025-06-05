// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'ASECRETO_POR_DEFECTO',
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    idRol: number;
    nombre: string;
    apellidos: string;
    id_departamento?: number | null;
  }) {
    return {
      userId: payload.sub,
      email: payload.email,
      idRol: payload.idRol,
      nombre: payload.nombre,
      apellidos: payload.apellidos,
      id_departamento: payload.id_departamento || null,
    };
  }
}
