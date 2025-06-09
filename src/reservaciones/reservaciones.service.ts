// src/reservaciones/reservaciones.service.ts
import { PrismaService } from '../prisma/prisma.service';
import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';
import { TipoEvento } from 'generated/prisma';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Resend } from 'resend';
import { UpdateReservacioneDto } from './dto/update-reservacione.dto';
@Injectable()
export class ReservacionesService {
  private resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;
  constructor(private prisma: PrismaService) {}

  /**
   *
   * @param idReservacion
   * @returns el numero de asistencia real
   */
  async ObtenerAsistenciasSala(idReservacion: number) {
    try {
      const asistencias = await this.prisma.reservaciones.findUnique({
        where: { id: idReservacion },
      });
      if (!asistencias) throw new Error('Error con la consulta');
      return { message: 'ok', data: asistencias.numeroAsistentesReal };
    } catch (e) {
      console.error(e);
      return { message: e.message, data: null };
    }
  }

  async crearReservacion(createDto: CreateReservacioneDto) {
    console.log('=== crearReservacion llamado con DTO:', createDto);
    const {
      numeroReservacion,
      idUsuario,
      idSala,
      nombreEvento,
      tipoEvento,
      fechaEvento,
      horaInicio,
      horaFin,
      asistentes,
      observaciones,
      idTecnicoAsignado,
    } = createDto;

    try {
      const horaInicioDate = new Date(`1970-01-01T${horaInicio}:00`);
      const horaFinDate = new Date(`1970-01-01T${horaFin}:00`);

      const tecnico = await this.prisma.tecnicos.findUnique({
        where: { id: idTecnicoAsignado },
      });
      const usuario = await this.prisma.usuarios.findUnique({
        where: { id: idUsuario },
      });
      const sala = await this.prisma.salas.findUnique({
        where: { id: idSala },
      });
      if (usuario) {
        await this.enviarConfirmacionEmail(usuario, createDto, sala);
      }
      if (!tecnico || !sala || !usuario)
        throw new Error('Error con la consulta');

      const nueva = await this.prisma.reservaciones.create({
        data: {
          numeroReservacion: numeroReservacion,
          idUsuario: idUsuario,
          idSala: idSala,
          nombreEvento: nombreEvento,
          tipoEvento: tipoEvento as TipoEvento, // Cast string to enum type (TipoEvento)
          fechaEvento: new Date(fechaEvento), // convierte ISO string a Date
          horaInicio: horaInicioDate, // guarda solo hora (Time)
          horaFin: horaFinDate,
          numeroAsistentesEstimado: asistentes,
          numeroAsistentesReal: asistentes, // CAMBIAR: SOLO ES TEMPORAL PARA PROBAR
          observaciones: observaciones ?? null,
          // ---------------------------------------------
          // El resto de campos (idTecnicoAsignado, numeroAsistentesReal,
          // estadoSolicitud, tipoRecurrencia, fechaFinRecurrencia, ...)
          // se completarán con valores por defecto o null.
          // ---------------------------------------------
        },
      });
      return nueva;
    } catch (e) {
      throw new BadRequestException(
        'No se pudo crear la reservación: ' + e.message,
      );
    }
  }

  async obtenerReservaciones() {
    return this.prisma.reservaciones.findMany();
  }
  async enviarConfirmacionEmail(
    usuario: any,
    reservacion: CreateReservacioneDto,
    sala: any,
    departamento: any | null = null,
  ) {
    try {
      if (!this.resend) {
        console.log('⚠️ Resend no está configurado. Saltando envío de email.');
        return;
      }

      const templatePath = path.join(
        __dirname,
        '..',
        'template',
        'correo_cicese_formato.hbs',
      );
      console.log('📧 Intentando leer template desde:', templatePath);

      const templateHtml = fs.readFileSync(templatePath, 'utf8');

      const template = Handlebars.compile(templateHtml);
      const htmlContent = template({
        name: usuario.nombre,
        nombreEvento: reservacion.nombreEvento,
        tipo: reservacion.tipoEvento,
        fecha: reservacion.fechaEvento,
        horaInicio: reservacion.horaInicio,
        horaFin: reservacion.horaFin,
        participantes: 0,
        solicitante: usuario.nombre || 'Usuario',
        departamento: 'N/A',
        emailSolicitante: usuario.email,
        nombreSala: sala.nombreSala || 'Sala asignada',
        ubicacionSala: sala.ubicacion || 'Edificio principal',
      });

      await this.resend.emails.send({
        from: process.env.SEND_EMAIL_FROM || 'telematica@isyte.dev',
        to: usuario.email,
        subject: 'Confirmación de Reservación',
        html: htmlContent,
      });

      console.log(
        '✅ Email de confirmación enviado exitosamente a:',
        usuario.email,
      );
    } catch (error) {
      console.error('❌ Error al enviar email de confirmación:', error.message);
      // No lanzamos la excepción para que no afecte la creación de la reservación
    }
  }

  async enviarCorreoPrueba() {
    if (!this.resend) {
      return {
        message:
          'Resend no está configurado. No se pudo enviar el correo de prueba.',
      };
    }

    this.resend.emails.send({
      from: process.env.SEND_EMAIL_FROM || 'telematica@isyte.dev',
      to: 'gonzalez372576@uabc.edu.mx',
      subject: 'Prueba de envío de correo',
      html: '<h1>¡Hola!</h1><p>Este es un correo de prueba.</p>',
    });

    return {
      message: 'Correo de prueba enviado correctamente',
    };
  }

  /**
   *
   * @param idUsuario
   * @description Obtiene el historial de reservaciones anteriores de un usuario.
   * @returns Arreglo de reservaciones anteriores del usuario especificado.
   */
  async reservacionesAnteriores(idUsuario: number) {
    //Obtiene las reservaciones de un usuario en específico
    const reservacionesUsuario = await this.prisma.reservaciones.findMany({
      select: {
        id: true,
        numeroReservacion: true,
        nombreEvento: true,
        idSala: true,
        fechaEvento: true,
        estadoSolicitud: true,
        horaInicio: true,
        horaFin: true,
      },
      where: {
        idUsuario: idUsuario,
      },
    });

    // Obtiene los nombres de las salas
    const salas = await this.prisma.salas.findMany({
      select: {
        id: true,
        nombreSala: true,
      },
    });

    // Verifica si el usuario tiene o no reservaciones
    if (reservacionesUsuario.length === 0) {
      throw new HttpException(
        'No se encontraron reservaciones para el usuario especificado',
        HttpStatus.NOT_FOUND,
      );
    }

    // Mapea los nombres de las salas a las reservaciones del usuario
    const historial = reservacionesUsuario.map((reservacion) => {
      const sala = salas.find((s) => s.id === reservacion.idSala);
      return {
        id: reservacion.id,
        numeroReservacion: reservacion.numeroReservacion,
        nombreEvento: reservacion.nombreEvento,
        nombreSala: sala ? sala.nombreSala : 'Sala no encontrada',
        fechaEvento: reservacion.fechaEvento,
        estadoSolicitud: reservacion.estadoSolicitud,
        horaInicio: (() => {
          const date =
            reservacion.horaInicio instanceof Date
              ? reservacion.horaInicio
              : new Date(reservacion.horaInicio);
          const hours = String(date.getUTCHours()).padStart(2, '0');
          const minutes = String(date.getUTCMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        })(),
        horaFin: (() => {
          const date =
            reservacion.horaFin instanceof Date
              ? reservacion.horaFin
              : new Date(reservacion.horaFin);
          const hours = String(date.getUTCHours()).padStart(2, '0');
          const minutes = String(date.getUTCMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        })(),
      };
    });

    // Devuelve el historial de reservaciones completo
    return historial.map((reservacion) => ({
      idReservacion: reservacion.id,
      numeroSolicitud: reservacion.numeroReservacion,
      nombreEvento: reservacion.nombreEvento,
      salaEvento: reservacion.nombreSala,
      fechaEvento: reservacion.fechaEvento,
      estadoActual: reservacion.estadoSolicitud,
      horaInicio: reservacion.horaInicio,
      horaFin: reservacion.horaFin,
    }));
  }

  async detalleReservacion(numeroSolicitud: string) {
    const reservaciones = await this.prisma.reservaciones.findUnique({
      where: {
        numeroReservacion: numeroSolicitud,
      },
    });

    if (!reservaciones) {
      return {
        message: 'Lo sentimos, no se encontró la reservación',
        data: null,
      };
    }

    return {
      numeroSolicitud: reservaciones.numeroReservacion,
      nombreEvento: reservaciones.nombreEvento,
      tipoEvento: reservaciones.tipoEvento,
      fechaEvento: reservaciones.fechaEvento,
      horaInicio: reservaciones.horaInicio,
      horaFin: reservaciones.horaFin,
      numeroAsistentesEstimado: reservaciones.numeroAsistentesEstimado,
      numeroAsistentesReales: reservaciones.numeroAsistentesReal,
      estadoActual: reservaciones.estadoSolicitud,
      TipoRecurrencia: reservaciones.tipoRecurrencia,
      fechaFinRecurrencia: reservaciones.fechaFinRecurrencia,
      observaciones: reservaciones.observaciones,
      fechaCreacion: reservaciones.fechaCreacionSolicitud,
      fechaModificacion: reservaciones.fechaUltimaModificacion,
    };
  }

  /**
   * @Description Actualiza una reservación existente.
   * @param numeroSolicitud
   * @param reservacionDto
   * @returns
   */
  async actualizarReservacion(reservacionDto: UpdateReservacioneDto) {
    if (!reservacionDto.numeroReservacion) {
      throw new BadRequestException(
        'El número de reservación es requerido para actualizar',
      );
    }

    const actualizado = await this.prisma.reservaciones.update({
      where: {
        numeroReservacion: reservacionDto.numeroReservacion,
      },
      data: {
        nombreEvento: reservacionDto.nombreEvento,
        idSala: reservacionDto.idSala,
        idUsuario: reservacionDto.idUsuario,
        tipoEvento: reservacionDto.tipoEvento as TipoEvento,
        ...(reservacionDto.fechaEvento
          ? { fechaEvento: new Date(reservacionDto.fechaEvento) }
          : {}),
        ...(reservacionDto.horaInicio
          ? {
              horaInicio: new Date(
                `1970-01-01T${reservacionDto.horaInicio}:00`,
              ),
            }
          : {}),
        ...(reservacionDto.horaFin
          ? { horaFin: new Date(`1970-01-01T${reservacionDto.horaFin}:00`) }
          : {}),
        numeroAsistentesEstimado: reservacionDto.asistentes,
        numeroAsistentesReal: reservacionDto.asistentes,
        observaciones: reservacionDto.observaciones || null,
        idTecnicoAsignado: reservacionDto.idTecnicoAsignado || null,
        fechaUltimaModificacion: new Date(),
        estadoSolicitud: reservacionDto.estadoSolicitud || 'Pendiente',
        tipoRecurrencia: reservacionDto.tipoRecurrencia,
        fechaFinRecurrencia: reservacionDto.fechaFinRecurrencia || null,
        idUsuarioUltimaModificacion:
          reservacionDto.idUsuarioUltimaModificacion || null,
        linkReunionOnline: reservacionDto.linkReunion || null,
        fallasRegistradas: reservacionDto.fallasRegistradas || null,
      },
    });

    if (!actualizado) {
      throw new HttpException(
        'No se pudo actualizar la reservación',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      message: 'Reservación actualizada correctamente',
      data: actualizado,
    };
  }

  async findAllByDateRange(fechaInicio?: string, fechaFin?: string) {
    try {
      const where: any = {};

      if (fechaInicio || fechaFin) {
        where.fechaEvento = {};
        if (fechaInicio) {
          where.fechaEvento.gte = new Date(fechaInicio);
        }
        if (fechaFin) {
          where.fechaEvento.lte = new Date(fechaFin);
        }
      }

      const reservaciones = await this.prisma.reservaciones.findMany({
        where,
        include: {
          sala: {
            select: {
              nombreSala: true,
              ubicacion: true,
            },
          },
          usuario: {
            select: {
              nombre: true,
              apellidos: true,
              email: true,
            },
          },
        },
        orderBy: {
          fechaEvento: 'asc',
        },
      });

      return {
        error: false,
        mensaje: 'Reservaciones encontradas exitosamente',
        data: reservaciones,
      };
    } catch (error) {
      return {
        error: true,
        mensaje: 'Error al buscar las reservaciones: ' + error.message,
        data: null,
      };
    }
  }
}
