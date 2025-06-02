// src/auth/auth.controller.ts
import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Ruta POST /auth/login
   * Recibe { email, contraseña } en el body.
   * Si la estrategia local valida OK, Passport pone el usuario en req.user.
   * Luego llamamos a this.authService.login(req.user) para generar el JWT.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK) // Si se devuelve exitosamente, regresamos 200 en vez de 201
  async login(@Request() req) {
    // req.user fue poblado por LocalAuthGuard con el retorno de validate()
    return this.authService.login(req.user);
  }
}
