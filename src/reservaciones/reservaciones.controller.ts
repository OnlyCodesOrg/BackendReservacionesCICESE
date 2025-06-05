// src/reservaciones/reservaciones.controller.ts

import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { respuestaGenerica } from 'src/salas/dto/respuesta-generica.dto';

@Controller('reservaciones')
export class ReservacionesController {
  constructor(private readonly reservacionesService: ReservacionesService) { }

  @Get('/reporte/:idReservacion')
  @ApiOperation({
    summary: "Obtiene el numero de asistencia real de dicha reservacion"
  })
  @ApiParam({
    name: 'idReservacion',
    description: 'El id de la reservacion',
    required: true
  })
  @ApiResponse({
    status: 200,
    description:'Retorna un json con un mensaje de posible error y un data, que puede ser null o el resultado de la consulta',
    type: respuestaGenerica
  })
  @ApiResponse({
    status: 400,
    description:'Retorna un json con un mensaje de posible error y un data, que puede ser null o el resultado de la consulta',
    type: respuestaGenerica
  })
  async ObtenerAsistenciaSalas(@Param('idReservacion', ParseIntPipe) idReservacion: number) {
    return await this.reservacionesService.ObtenerAsistenciasSala(idReservacion);
  }

  @Post('/crear')
  async create(@Body() createReservacioneDto: CreateReservacioneDto) {
    return await this.reservacionesService.crearReservacion(
      createReservacioneDto,
    );
  }

  @ApiOperation({
    summary: 'Obtener reservaciones por ID de usuario',
    description:
      'Devuelve todas las reservaciones asociadas a un usuario específico.',
  })
  @ApiParam({
    name: 'idUsuario',
    description: 'ID del usuario cuyas reservaciones se desean obtener',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reservaciones del usuario',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          idReservacion: {
            type: 'number',
            description: 'ID de la reservación',
          },
          numeroSolicitud: {
            type: 'string',
            description: 'Número de solicitud de la reservación',
          },
          nombreEvento: {
            type: 'string',
            description: 'Nombre del evento asociado a la reservación',
          },
          salaEvento: {
            type: 'string',
            description: 'Nombre de la sala reservada para el evento',
          },
          fechaEvento: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha del evento en formato ISO 8601',
          },
          estadoActual: {
            type: 'string',
            description: 'Estado actual de la solicitud de reservación',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron reservaciones para el usuario especificado',
  })
  @Get('historial/:idUsuario')
  async reservacionesAnteriores(@Param('idUsuario') idUsuario: string) {
    const id = parseInt(idUsuario, 10);
    return await this.reservacionesService.reservacionesAnteriores(id);
  }
}
