import { Controller, Get, Post, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SalasService } from './salas.service';
import { ValidarDisponibilidadDto } from './dto/validar-disponibilidad.dto';
import { ValidarDisponibilidadResponseDto } from './dto/validar-disponibilidad-response.dto';

@ApiTags('salas')
@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  /**
   * Obtiene la lista de salas disponibles dentro del rango de fechas
   * @param fechas {inicio:Date, fin:Date, (Opcional) salasSeleccionadas?:[id,id,id...]}
   * @returns [salas]
   */
  @Post('listar')
  async ListarSalas(@Body() data) {
    const res = this.salasService.ObtenerSalas(
      new Date(data.inicio),
      new Date(data.fin),
      data.salasSeleccionadas,
    );
    return { message: 'ok', data: res };
  }

  /**
   * Valida si hay conflictos de horario para una reserva
   * @param data {idSala: number, fechaEvento: Date, horaInicio: string, horaFin: string}
   * @returns {hasConflict: boolean, conflictDetails?, sugerencias?}
   */
  @Post('validar-disponibilidad')
  @ApiOperation({
    summary: 'Validar disponibilidad de sala',
    description:
      'Valida si hay conflictos de horario para una reserva en una sala específica',
  })
  @ApiBody({
    description: 'Datos para validar la disponibilidad de la sala',
    type: ValidarDisponibilidadDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Validación completada exitosamente',
    type: ValidarDisponibilidadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async ValidarDisponibilidad(
    @Body() data: ValidarDisponibilidadDto,
  ): Promise<ValidarDisponibilidadResponseDto> {
    const resultado = await this.salasService.validarDisponibilidadSala(
      data.idSala,
      new Date(data.fechaEvento),
      data.horaInicio,
      data.horaFin,
    );

    if (resultado.hasConflict) {
      return {
        success: false,
        message: 'Conflicto de horario detectado',
        conflict: resultado,
      };
    }

    return {
      success: true,
      message: 'Horario disponible',
      conflict: resultado,
    };
  }
}
