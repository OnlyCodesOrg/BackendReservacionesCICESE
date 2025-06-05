import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SalasService } from './salas.service';
import { ValidarDisponibilidadDto } from './dto/validar-disponibilidad.dto';
import { ValidarDisponibilidadResponseDto } from './dto/validar-disponibilidad-response.dto';
import { HistorialSalasResponseDto } from './dto/historial-salas-response.dto';
import { HistorialUsoSalaResponseDto } from './dto/historial-uso-sala-response.dto';
import { DetalleEventoResponseDto } from './dto/detalle-evento-response.dto';
import { InventarioSalaResponseDto } from './dto/inventario-sala.dto';
import {
  ActualizarInventarioResponseDto,
  ActualizarInventarioSalaDto,
} from './dto/actualizar-inventario.dto';
import { listarSalas } from './dto/listar-equipo.dto';
import { respuestaGenerica } from './dto/respuesta-generica.dto';
import { actualizarEquipo } from './dto/actualizar-equipo.dto';

@ApiTags('salas')
@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  /**
   * Obtiene la lista de salas disponibles dentro del rango de fechas
   * @returns [salas]
   */
  @Post('listar')
  @ApiOperation({
    description: 'Obtiene la lista de salas con un rango de fechas definidas',
  })
  @ApiBody({
    type: listarSalas,
  })
  @ApiResponse({
    status: 200,
    type: respuestaGenerica,
  })
  @ApiResponse({
    status: 400,
    type: respuestaGenerica,
  })
  async ListarSalas(@Body() data: listarSalas) {
    const res = this.salasService.ObtenerSalas(
      new Date(data.inicioFecha),
      new Date(data.finFecha),
      data.salasSeleccionadas,
    );
    return { message: 'ok', data: res };
  }

  /**
   * Obtiene el equipo de la sala especificada, retorna un objeto con un message y data,
   * donde data puede ser null en caso de no encontrar algo
   * @param idSala id de la sala, enviado desde la URL
   * @returns {message:"ok"|| error encontrad,data:[equipos] || null }
   */
  @ApiOperation({
    description: 'Obtiene la lista de equipos que tenga dicha sala',
  })
  @ApiResponse({
    status: 200,
    type: respuestaGenerica,
  })
  @ApiResponse({
    status: 400,
    type: respuestaGenerica,
  })
  @Get('equipo/:idSala')
  async ObtenerEquipoDeSala(@Param('idSala', ParseIntPipe) idSala: number) {
    return await this.salasService.ObtenerEquipoDeSala(idSala);
  }

  /**
   * Actualiza los atributos del equipo,
   * @param nuevoEquipo Un json con el id del equipo y los atributos a actualizar
   * @returns {message:ok || error, data:resultado||null}
   */
  @Post('equipo/actualizar')
  @ApiOperation({
    summary: 'Actualizar equipo',
  })
  @ApiBody({
    description: 'Necesita el id del equipo y los atributos a actualizar',
    type: actualizarEquipo,
  })
  @ApiResponse({
    status: 200,
    description: 'Responde con un mensaje y la data',
    type: respuestaGenerica,
  })
  @ApiResponse({
    status: 400,
    description: 'Responde con un mensaje y la data',
    type: respuestaGenerica,
  })
  async ActualizarEquipo(@Body() data: any) {
    return await this.salasService.ActualizarEquipoDeSala(data);
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

  /**
   * Obtiene la lista de salas con información resumida de su historial
   * @returns Lista de salas con estadísticas de uso
   */
  @Get('historial')
  @ApiOperation({
    summary: 'Obtener salas con información de historial',
    description:
      'Obtiene la lista de salas con estadísticas resumidas de su historial de uso',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de salas obtenida exitosamente',
    type: HistorialSalasResponseDto,
  })
  async obtenerSalasConHistorial(): Promise<HistorialSalasResponseDto> {
    const salas = await this.salasService.obtenerSalasConHistorial();
    return {
      success: true,
      message: 'Salas obtenidas exitosamente',
      data: salas,
    };
  }

  async consultarDisponibilidadSala(@Body() fechaActual: Date) {
    const disponibilidad =
      await this.salasService.consultarDisponibilidadSala(fechaActual);
    return {
      success: true,
      message: 'Disponibilidad de sala consultada exitosamente',
      data: disponibilidad,
    };
  }

  /**
   * Obtiene el historial de uso de una sala específica
   * @param idSala ID de la sala
   * @param limite Número máximo de registros
   * @param offset Offset para paginación
   * @returns Historial de eventos de la sala
   */
  @Get('historial/:idSala')
  @ApiOperation({
    summary: 'Obtener historial de uso de sala',
    description:
      'Obtiene el historial completo de eventos realizados en una sala específica',
  })
  @ApiParam({
    name: 'idSala',
    description: 'ID de la sala',
    type: 'number',
  })
  @ApiQuery({
    name: 'limite',
    description: 'Número máximo de registros a retornar',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset para paginación',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido exitosamente',
    type: HistorialUsoSalaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sala no encontrada',
  })
  async obtenerHistorialSala(
    @Param('idSala') idSala: string,
    @Query('limite') limite?: string,
    @Query('offset') offset?: string,
  ): Promise<HistorialUsoSalaResponseDto> {
    const id = parseInt(idSala);
    const lim = limite ? parseInt(limite) : 50;
    const off = offset ? parseInt(offset) : 0;

    const historial = await this.salasService.obtenerHistorialSala(
      id,
      lim,
      off,
    );

    return {
      success: true,
      message: 'Historial obtenido exitosamente',
      data: historial,
    };
  }

  /**
   * Obtiene el detalle completo de un evento específico
   * @param idReservacion ID de la reservación
   * @returns Detalle completo del evento
   */
  /**
   * Obtiene el inventario de una sala específica
   * @param idSala ID de la sala
   * @returns Información detallada del inventario de la sala
   */
  @Get('inventario/:idSala')
  @ApiOperation({
    summary: 'Obtener inventario de sala',
    description:
      'Obtiene el inventario completo de una sala específica incluyendo cantidades y estado de los elementos',
  })
  @ApiParam({
    name: 'idSala',
    description: 'ID de la sala',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario obtenido exitosamente',
    type: InventarioSalaResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sala no encontrada',
  })
  async obtenerInventarioSala(
    @Param('idSala') idSala: string,
  ): Promise<InventarioSalaResponseDto> {
    const id = parseInt(idSala);
    const resultado = await this.salasService.obtenerInventarioSala(id);

    return {
      success: true,
      message: 'Inventario obtenido exitosamente',
      sala: {
        id: resultado.sala.id,
        nombreSala: resultado.sala.nombreSala,
        ubicacion: resultado.sala.ubicacion || undefined,
      },
      inventario: resultado.inventario,
    };
  }

  @Post('inventario/:idSala')
  @ApiOperation({
    summary: 'Actualizar inventario de sala',
    description:
      'Permite a un técnico modificar el inventario de una sala específica',
  })
  @ApiParam({
    name: 'idSala',
    description: 'ID de la sala',
    type: 'number',
  })
  @ApiBody({ type: ActualizarInventarioSalaDto })
  @ApiResponse({
    status: 200,
    description: 'Inventario actualizado exitosamente',
    type: ActualizarInventarioResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sala no encontrada',
  })
  async actualizarInventarioSala(
    @Param('idSala') idSala: string,
    @Body() actualizarInventarioDto: ActualizarInventarioSalaDto,
  ): Promise<ActualizarInventarioResponseDto> {
    const id = parseInt(idSala);

    // Verificar que el ID de la sala en el path coincide con el del body
    if (
      actualizarInventarioDto.idSala &&
      actualizarInventarioDto.idSala !== id
    ) {
      throw new BadRequestException(
        'El ID de la sala en el path no coincide con el ID en el body',
      );
    }

    const resultado = await this.salasService.actualizarInventarioSala(
      id,
      actualizarInventarioDto.elementos,
    );

    return {
      success: true,
      message: 'Inventario actualizado exitosamente',
      sala: resultado,
    };
  }

  @Get('evento/:idReservacion')
  @ApiOperation({
    summary: 'Obtener detalle de evento',
    description:
      'Obtiene el detalle completo de un evento específico incluyendo participantes y servicios',
  })
  @ApiParam({
    name: 'idReservacion',
    description: 'ID de la reservación',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle del evento obtenido exitosamente',
    type: DetalleEventoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Evento no encontrado',
  })
  async obtenerDetalleEvento(
    @Param('idReservacion') idReservacion: string,
  ): Promise<DetalleEventoResponseDto> {
    const id = parseInt(idReservacion);
    const detalle = await this.salasService.obtenerDetalleEvento(id);

    if (!detalle) {
      return {
        success: false,
        message: 'Evento no encontrado',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Detalle del evento obtenido exitosamente',
      data: detalle,
    };
  }

  /**
   * Obtiene información de una sala específica
   * @param idSala ID de la sala
   * @returns Información completa de la sala
   */
  @Get(':idSala')
  @ApiOperation({
    summary: 'Obtener información de sala',
    description: 'Obtiene la información completa de una sala específica',
  })
  @ApiParam({
    name: 'idSala',
    description: 'ID de la sala',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de la sala obtenida exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Sala no encontrada',
  })
  async obtenerSalaPorId(@Param('idSala') idSala: string) {
    const id = parseInt(idSala);
    const sala = await this.salasService.obtenerSalaPorId(id);

    if (!sala) {
      return {
        success: false,
        message: 'Sala no encontrada',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Sala obtenida exitosamente',
      data: sala,
    };
  }
}
