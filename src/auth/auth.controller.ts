import {
  Controller,
  Request,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, ProfileResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Permite a un usuario iniciar sesión proporcionando su correo electrónico y contraseña. Devuelve un token JWT si las credenciales son válidas.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    const result = await this.authService.login(req.user);
    return {
      success: true,
      message: 'Has iniciado sesión correctamente.',
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Obtener perfil del usuario',
    description:
      'Obtiene la información del perfil del usuario autenticado. Esta petición debe realizarse después de haber iniciado sesión y proporcionar el token de acceso en el header Authorization.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token no válido o expirado',
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: req.user,
    };
  }

  @ApiOperation({
    summary: 'Refrescar token',
    description:
      'Obtiene un nuevo token de acceso utilizando el token de refresco.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de refresco inválido o expirado',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req, @Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(
      req.user.sub,
      refreshTokenDto.refreshToken,
    );
    return {
      success: true,
      message: 'Token refrescado exitosamente',
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Cierra la sesión del usuario actual invalidando sus tokens.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
  })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    return await this.authService.logout(req.user.sub);
  }
}
