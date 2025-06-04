// src/reservaciones/reservaciones.controller.ts

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('reservaciones')
export class ReservacionesController {
  constructor(private readonly reservacionesService: ReservacionesService) {}

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
