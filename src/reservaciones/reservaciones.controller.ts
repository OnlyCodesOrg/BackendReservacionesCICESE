// src/reservaciones/reservaciones.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { respuestaGenerica } from 'src/salas/dto/respuesta-generica.dto';
import { UpdateReservacioneDto } from './dto/update-reservacione.dto';
import { FindReservacionesByDateDto } from './dto/find-reservaciones-by-date.dto';
import { SolicitudAprobacion, AccionAprobacion } from '../types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservaciones')
export class ReservacionesController {
  constructor(private readonly reservacionesService: ReservacionesService) {}

  @Get('/reporte/:idReservacion')
  @ApiOperation({
    summary: 'Obtiene el numero de asistencia real de dicha reservacion',
  })
  @ApiParam({
    name: 'idReservacion',
    description: 'El id de la reservacion',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      'Retorna un json con un mensaje de posible error y un data, que puede ser null o el resultado de la consulta',
    type: respuestaGenerica,
  })
  @ApiResponse({
    status: 400,
    description:
      'Retorna un json con un mensaje de posible error y un data, que puede ser null o el resultado de la consulta',
    type: respuestaGenerica,
  })
  async ObtenerAsistenciaSalas(
    @Param('idReservacion', ParseIntPipe) idReservacion: number,
  ) {
    return await this.reservacionesService.ObtenerAsistenciasSala(
      idReservacion,
    );
  }

  @Post('/crear')
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
          horaInicio: {
            type: 'string',
            format: 'time',
            description: 'Hora de inicio del evento en formato ISO 8601',
          },
          horaFin: {
            type: 'string',
            format: 'time',
            description: 'Hora de fin del evento en formato ISO 8601',
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

  @ApiOperation({
    summary: 'Modificar una reservación existente',
    description:
      'Permite modificar una reservación existente con los nuevos datos proporcionados.',
  })
  @ApiBody({
    description: 'Datos necesarios para modificar una reservación existente',
    type: UpdateReservacioneDto,
    examples: {
      ejemploCompleto: {
        summary: 'Ejemplo completo de modificación de reservación',
        value: {
          numeroReservacion: 'RES-1749335367102',
          idSala: 2,
          idUsuario: 1,
          nombreEvento: 'Conferencia de Tecnología 2025',
          tipoEvento: 'Conferencia',
          fechaEvento: '2025-08-15',
          horaInicio: '09:00',
          horaFin: '17:30',
          numeroAsistentes: 120,
          numeroAsistentesReal: 120,
          estadoSolicitud: 'Cancelada',
          observaciones: 'Evento anual con ponentes internacionales.',
          idTecnicoAsignado: 1,
          tipoRecurrencia: 'Diaria',
          fechaFinRecurrencia: '2025-08-15T00:00:00.000Z',
          idUsuarioUltimaModificacion: 2,
          fallasRegistradas:
            'Fallaron las camaras, el microfono se escuchaba muy saturado, la camara no enfocaba bien',
          linkReunion: 'https://link',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reservación modificada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensaje de éxito',
          example: 'Reservación modificada exitosamente',
        },
        data: {
          type: 'object',
          description: 'Datos de la reservación modificada',
          properties: {
            numeroReservacion: {
              type: 'string',
              description: 'Número de reservación modificado',
              example: 'RES-1749335367102',
            },
            idUsuario: {
              type: 'number',
              description: 'ID del usuario que realizó la reservación',
              example: 1,
            },
            idTecnicoAsignado: {
              type: 'number',
              description: 'ID del técnico asignado',
              example: 1,
            },
            idSala: {
              type: 'number',
              description: 'ID de la sala reservada',
              example: 2,
            },
            nombreEvento: {
              type: 'string',
              description: 'Nombre del evento',
              example: 'Conferencia de Tecnología 2025',
            },
            tipoEvento: {
              type: 'string',
              description: 'Tipo de evento',
              example: 'Videoconferencia',
            },
            fechaEvento: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha del evento',
              example: '2025-08-15T00:00:00.000Z',
            },
            horaInicio: {
              type: 'string',
              format: 'date-time',
              description:
                'Hora de inicio del evento (como fecha hora para compatibilidad)',
              example: '1970-01-01T17:00:00.000Z',
            },
            horaFin: {
              type: 'string',
              format: 'date-time',
              description:
                'Hora de fin del evento (como fecha hora para compatibilidad)',
              example: '1970-01-01T01:30:00.000Z',
            },
            numeroAsistentesEstimado: {
              type: 'number',
              description: 'Número estimado de asistentes',
              example: 120,
            },
            numeroAsistentesReal: {
              type: 'number',
              description: 'Número real de asistentes',
              example: 120,
            },
            estadoSolicitud: {
              type: 'string',
              description: 'Estado actual de la solicitud',
              example: 'Cancelada',
            },
            tipoRecurrencia: {
              type: 'string',
              description: 'Tipo de recurrencia del evento',
              example: 'Diaria',
            },
            fechaFinRecurrencia: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha fin de la recurrencia',
              example: '2025-08-15T00:00:00.000Z',
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones adicionales',
              example: 'Evento anual con ponentes internacionales.',
            },
            fechaCreacionSolicitud: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la solicitud',
              example: '2025-06-07T22:29:27.135Z',
            },
            fechaUltimaModificacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de la última modificación',
              example: '2025-06-08T06:44:01.097Z',
            },
            idUsuarioUltimaModificacion: {
              type: 'number',
              description: 'ID del usuario que hizo la última modificación',
              example: 2,
            },
            linkReunionOnline: {
              type: 'string',
              format: 'uri',
              description: 'Link a la reunión en línea',
              example: 'https://link',
            },
            fallasRegistradas: {
              type: 'string',
              description: 'Descripción de fallas reportadas durante el evento',
              example:
                'Fallaron las camaras, el microfono se escuchaba muy saturado, la camara no enfocaba bien',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Problemas al modificar la reservación',
  })
  @Patch('/modificar')
  async modificarReservacion(@Body() reservacion: UpdateReservacioneDto) {
    return await this.reservacionesService.actualizarReservacion(reservacion);
  }

  @Get('listar')
  @ApiOperation({
    summary: 'Listar todas las reservaciones',
    description:
      'Obtiene todas las reservaciones con opción de filtrar por rango de fechas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reservaciones encontradas',
    schema: {
      type: 'object',
      properties: {
        error: {
          type: 'boolean',
          description: 'Indica si hubo un error en la operación',
        },
        mensaje: {
          type: 'string',
          description: 'Mensaje descriptivo del resultado',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              numeroReservacion: { type: 'string' },
              nombreEvento: { type: 'string' },
              fechaEvento: { type: 'string', format: 'date-time' },
              horaInicio: { type: 'string' },
              horaFin: { type: 'string' },
              estadoSolicitud: { type: 'string' },
              sala: {
                type: 'object',
                properties: {
                  nombreSala: { type: 'string' },
                  ubicacion: { type: 'string' },
                },
              },
              usuario: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  apellido: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  async findAll(@Query() params: FindReservacionesByDateDto) {
    return await this.reservacionesService.findAllByDateRange(
      params.fechaInicio,
      params.fechaFin,
    );
  }

  @Get('/solicitudes-pendientes/:idUsuario')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener solicitudes pendientes de aprobación técnica',
    description:
      'Obtiene las solicitudes de reservación pendientes que el técnico puede aprobar según las salas asignadas',
  })
  @ApiParam({
    name: 'idUsuario',
    description:
      'ID del usuario que solicita las pendientes (debe ser técnico responsable de salas)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes pendientes de aprobación técnica',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          participantes: { type: 'number' },
          estadoSolicitud: { type: 'string' },
          numeroReservacion: { type: 'string' },
          nombreEvento: { type: 'string' },
          fechaEvento: { type: 'string', format: 'date-time' },
          solicitante: {
            type: 'object',
            properties: {
              nombre: { type: 'string' },
              email: { type: 'string' },
              departamento: { type: 'string' },
            },
          },
          tecnicoResponsable: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              nombre: { type: 'string' },
              especialidad: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async obtenerSolicitudesPendientes(
    @Param('idUsuario') idUsuario: string,
  ): Promise<SolicitudAprobacion[]> {
    const id = parseInt(idUsuario, 10);
    return await this.reservacionesService.obtenerSolicitudesPendientes(id);
  }

  @Post('/procesar-aprobacion')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Aprobar o rechazar una reservación (aprobación técnica)',
    description:
      'Permite a un técnico autorizado aprobar o rechazar una solicitud de reservación por motivos técnicos',
  })
  @ApiBody({
    description: 'Datos para procesar la aprobación técnica',
    schema: {
      type: 'object',
      properties: {
        numeroReservacion: {
          type: 'string',
          description: 'Número de la reservación',
        },
        accion: {
          type: 'string',
          enum: ['aprobar', 'rechazar'],
          description: 'Acción a realizar',
        },
        motivo: {
          type: 'string',
          description: 'Motivo del rechazo técnico (opcional)',
        },
        idTecnicoAprobador: {
          type: 'number',
          description: 'ID del técnico que aprueba/rechaza',
        },
      },
      required: ['numeroReservacion', 'accion', 'idTecnicoAprobador'],
    },
    examples: {
      aprobar: {
        summary: 'Aprobar reservación técnicamente',
        value: {
          numeroReservacion: 'RES-20250603-002',
          accion: 'aprobar',
          idTecnicoAprobador: 1,
        },
      },
      rechazar: {
        summary: 'Rechazar reservación por motivos técnicos',
        value: {
          numeroReservacion: 'RES-20250603-002',
          accion: 'rechazar',
          motivo: 'Equipos necesarios no disponibles en la fecha solicitada',
          idTecnicoAprobador: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Aprobación técnica procesada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          description: 'Datos de la reservación actualizada',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en el formato de los datos proporcionados',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos técnicos para aprobar esta reservación',
  })
  async procesarAprobacion(@Body() accionDto: AccionAprobacion) {
    return await this.reservacionesService.procesarAprobacion(accionDto);
  }

  @Get('/reservacion/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener detalles de una reservación específica',
    description:
      'Obtiene los detalles completos de una reservación por su ID. Requiere autenticación.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la reservación',
    required: true,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la reservación encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        numeroReservacion: { type: 'string' },
        nombreEvento: { type: 'string' },
        fechaEvento: { type: 'string', format: 'date' },
        horaInicio: { type: 'string' },
        horaFin: { type: 'string' },
        estadoSolicitud: { type: 'string' },
        numeroAsistentesEstimado: { type: 'number' },
        fechaCreacionSolicitud: { type: 'string', format: 'date-time' },
        linkReunionOnline: { type: 'string', nullable: true },
        observaciones: { type: 'string', nullable: true },
        equipoRequerido: { type: 'string', nullable: true },
        serviciosExtra: { type: 'string', nullable: true },
        usuario: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            email: { type: 'string' },
            departamento: { type: 'string' },
          },
        },
        sala: {
          type: 'object',
          properties: {
            nombreSala: { type: 'string' },
            ubicacion: { type: 'string' },
            piso: { type: 'string' },
            capacidad: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Reservación no encontrada o sin acceso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token no válido o expirado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async obtenerDetalleReservacion(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    console.log('=== obtenerDetalleReservacion llamado ===');
    console.log('ID recibido:', id, 'Tipo:', typeof id);
    console.log('Usuario del token:', req.user);
    
    try {
      // Get user ID from JWT token payload
      const idUsuario = req.user.userId;
      console.log('ID del usuario:', idUsuario);

      const resultado = await this.reservacionesService.obtenerDetalleReservacion(
        id,
        idUsuario,
      );
      
      console.log('Resultado obtenido exitosamente');
      return resultado;
    } catch (error) {
      console.error('Error en obtenerDetalleReservacion:', error);
      throw error;
    }
  }
}
