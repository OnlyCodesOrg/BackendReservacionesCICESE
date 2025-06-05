// src/reservaciones/reservaciones.controller.ts

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('reservaciones')
export class ReservacionesController {
  constructor(private readonly reservacionesService: ReservacionesService) {}
  @ApiOperation({
    summary: 'Crear una nueva reservación',
    description:
      'Crea una nueva reservación de sala con los datos proporcionados.',
  })
  @ApiBody({
    description: 'Datos necesarios para crear una nueva reservación',
    type: CreateReservacioneDto,
    examples: {
      example1: {
        summary: 'Ejemplo de reservación',
        value: {
          numeroReservacion: 'RES-20250603-002',
          idUsuario: 1,
          nombreEvento: 'Reunión de Proyecto X',
          idSala: 1,
          tipoEvento: 'Reunion',
          fechaEvento: '2025-06-10',
          horaInicio: '09:00',
          horaFin: '11:00',
          asistentes: 5,
          observaciones: 'Se requiere proyector y pizarrón',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reservación creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID único de la reservación generado automáticamente',
        },
        numeroReservacion: {
          type: 'string',
          description: 'Número de reservación proporcionado',
        },
        idUsuario: {
          type: 'number',
          description: 'ID del usuario que solicita la reservación',
        },
        idTecnicoAsignado: {
          type: 'number',
          nullable: true,
          description: 'ID del técnico asignado (null si no se ha asignado)',
        },
        idSala: {
          type: 'number',
          description: 'ID de la sala reservada',
        },
        nombreEvento: {
          type: 'string',
          description: 'Nombre del evento',
        },
        tipoEvento: {
          type: 'string',
          description:
            'Tipo de evento (Reunion, Videoconferencia, Presentacion, etc.)',
        },
        fechaEvento: {
          type: 'string',
          format: 'date-time',
          description: 'Fecha del evento en formato ISO 8601',
        },
        horaInicio: {
          type: 'string',
          format: 'date-time',
          description: 'Hora de inicio del evento',
        },
        horaFin: {
          type: 'string',
          format: 'date-time',
          description: 'Hora de fin del evento',
        },
        numeroAsistentesEstimado: {
          type: 'number',
          description: 'Número estimado de asistentes',
        },
        numeroAsistentesReal: {
          type: 'number',
          nullable: true,
          description: 'Número real de asistentes (null hasta que se registre)',
        },
        estadoSolicitud: {
          type: 'string',
          description: 'Estado actual de la solicitud (ej: Pendiente)',
        },
        tipoRecurrencia: {
          type: 'string',
          description: 'Tipo de recurrencia del evento (ej: Unica)',
        },
        fechaFinRecurrencia: {
          type: 'string',
          nullable: true,
          format: 'date-time',
          description: 'Fecha de fin de recurrencia (null para eventos únicos)',
        },
        observaciones: {
          type: 'string',
          nullable: true,
          description: 'Observaciones adicionales para la reservación',
        },
        fechaCreacionSolicitud: {
          type: 'string',
          format: 'date-time',
          description: 'Fecha y hora de creación de la solicitud',
        },
        fechaUltimaModificacion: {
          type: 'string',
          nullable: true,
          format: 'date-time',
          description:
            'Fecha de última modificación (null si no se ha modificado)',
        },
        idUsuarioUltimaModificacion: {
          type: 'number',
          nullable: true,
          description: 'ID del usuario que realizó la última modificación',
        },
        linkReunionOnline: {
          type: 'string',
          nullable: true,
          description: 'Link para reunión online (null si no aplica)',
        },
        fallasRegistradas: {
          type: 'string',
          nullable: true,
          description:
            'Fallas registradas durante el evento (null si no hay fallas)',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o conflicto de horarios',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o sala no encontrados',
  })
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
