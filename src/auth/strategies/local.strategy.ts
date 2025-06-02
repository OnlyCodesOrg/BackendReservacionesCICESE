import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Configuramos que la estrategia local use el campo "email" en lugar de "username"
    super({ usernameField: 'email', passwordField: 'contraseña' });
  }

  // validate() se ejecuta cuando hacemos POST /login con { email, contraseña }
  async validate(email: string, contraseña: string): Promise<any> {
    const user = await this.authService.validateUser(email, contraseña);
    // Si validateUser arroja UnauthorizedException, ya se capturará aquí y se retornará 401
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    // Si todo OK, Passport agregará el usuario a req.user
    return user;
  }
}
