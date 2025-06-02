import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extrae el token del header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'ASECRET_SECRETO_POR_DEFECTO',
    });
  }

  // validate() se ejecuta si el token es válido; payload es lo que se firmó en AuthService.login()
  async validate(payload: { sub: number; email: string; idRol: number }) {
    // Aquí puedes, por ejemplo, regresar solo lo que necesites dentro de `req.user`
    return { userId: payload.sub, email: payload.email, idRol: payload.idRol };
  }
}
