//src/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'contraseña' });
  }

  async validate(email: string, contraseña: string): Promise<any> {
    const user = await this.authService.validateUser(email, contraseña);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    return user;
  }
}
