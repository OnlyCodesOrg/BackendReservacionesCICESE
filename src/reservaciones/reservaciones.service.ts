// src/reservaciones/reservaciones.service.ts
import { PrismaService } from 'src/prisma/prisma.service';
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
@Injectable()
export class ReservacionesService {
  private resend = new Resend(process.env.RESEND_API_KEY);
  constructor(private prisma: PrismaService) {}

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
    } = createDto;

    try {
      console.log(
        '   ↪️ insertando en la BD remota, preparación de fechas/hora...',
      );
      const horaInicioDate = new Date(`1970-01-01T${horaInicio}:00`);
      const horaFinDate = new Date(`1970-01-01T${horaFin}:00`);

      const usuario = await this.prisma.usuarios.findUnique({
        where: { id: idUsuario },
      });
      const sala = await this.prisma.salas.findUnique({
        where: { id: idSala },
      });

      if (usuario) {
        this.enviarConfirmacionEmail(usuario, createDto, sala);
      }

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
          observaciones: observaciones ?? null,
          // ---------------------------------------------
          // El resto de campos (idTecnicoAsignado, numeroAsistentesReal,
          // estadoSolicitud, tipoRecurrencia, fechaFinRecurrencia, ...)
          // se completarán con valores por defecto o null.
          // ---------------------------------------------
        },
      });
      console.log('   ✅ Insert exitoso en BD remota:', nueva);
      return nueva;
    } catch (e) {
      console.error(
        '   ❌ Error al crear reservación en BD remota:',
        e.message,
      );
      throw new BadRequestException(
        'No se pudo crear la reservación: ' + e.message,
      );
    }
  }

  async obtenerReservaciones() {
    return this.prisma.reservaciones.findMany();
  }
  enviarConfirmacionEmail(
    usuario: any,
    reservacion: CreateReservacioneDto,
    sala: any,
    departamento: any | null = null,
  ) {
    const templateHtml = fs.readFileSync(
      path.join(__dirname, '..', 'template', 'correo_cicese_formato.hbs'),
      'utf8',
    );

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
      'nombre sala': sala.nombreSala || 'Sala asignada',
      ubicacionSala: sala.ubicacion || 'Edificio principal',
    });

    this.resend.emails.send({
      from: 'telematica@cicese.mx',
      to: usuario.email,
      subject: 'Confirmación de Reservación',
      html: htmlContent,
    });
  }

  async enviarCorreoPrueba() {
    this.resend.emails.send({
      from: 'telematica@isyte.dev',
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
}
