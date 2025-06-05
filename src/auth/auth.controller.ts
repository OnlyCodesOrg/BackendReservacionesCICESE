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

    if (!result.access_token) {
      return {
        success: false,
        message: 'Credenciales inválidas',
        data: null,
      };
    }

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
}
