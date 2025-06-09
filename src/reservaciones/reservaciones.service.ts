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
import { SolicitudAprobacion, AccionAprobacion } from '../types';

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

      const usuario = await this.prisma.usuarios.findUnique({
        where: { id: idUsuario },
        include: { departamento: true },
      });

      const sala = await this.prisma.salas.findUnique({
        where: { id: idSala },
        include: { departamento: true },
      });

      const tecnico = await this.prisma.tecnicos.findUnique({
        where: { id: sala?.idTecnicoResponsable },
        include: { usuario: true },
      });

      if (!sala || !usuario) {
        throw new Error('Error con la consulta de usuario o sala');
      }

      const nueva = await this.prisma.reservaciones.create({
        data: {
          numeroReservacion: numeroReservacion,
          idUsuario: idUsuario,
          idSala: idSala,
          nombreEvento: nombreEvento,
          tipoEvento: tipoEvento as TipoEvento,
          fechaEvento: new Date(fechaEvento),
          horaInicio: horaInicioDate,
          horaFin: horaFinDate,
          numeroAsistentesEstimado: asistentes,
          numeroAsistentesReal: asistentes,
          observaciones: observaciones ?? null,
          estadoSolicitud: 'Pendiente', // Set as pending for approval
          idTecnicoAsignado: idTecnicoAsignado || null, // Handle optional technician
        },
      });

      // Send pending confirmation email to user
      if (usuario) {
        await this.enviarConfirmacionPendiente(usuario, createDto, sala);
      }

      // Send approval request to responsible department
      await this.enviarSolicitudAprobacion(nueva, usuario, sala);

      // Note: Do NOT send notification to technician yet - only after approval

      return nueva;
    } catch (e) {
      throw new BadRequestException(
        'No se pudo crear la reservación: ' + e.message,
      );
    }
  }

  /**
   * Sends approval request email to the responsible department
   */
  async enviarSolicitudAprobacion(reservacion: any, usuario: any, sala: any) {
    try {
      if (!this.resend) {
        console.log(
          'Resend no está configurado. Saltando envío de email de aprobación.',
        );
        return;
      }

      // Get responsible users for the department
      const responsables = await this.prisma.usuarios.findMany({
        where: {
          OR: [
            {
              AND: [
                { id_rol: 4 }, // Jefe de Departamento
                { id_departamento: sala.idDepartamento },
              ],
            },
          ],
        },
        include: { departamento: true },
      });

      if (responsables.length === 0) {
        console.log(
          'No se encontraron responsables para aprobar la reservación',
        );
        return;
      }

      const templatePath = path.join(
        __dirname,
        '..',
        'template',
        'correo_cicese_formato.hbs',
      );

      const templateHtml = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateHtml);

      const fechaLimite = new Date(reservacion.fechaEvento);
      fechaLimite.setDate(fechaLimite.getDate() - 1); // 1 day before event

      for (const responsable of responsables) {
        const htmlContent = template({
          esAprobacion: true,
          responsableAprobacion: responsable.nombre,
          numeroReservacion: reservacion.numeroReservacion,
          nombreEvento: reservacion.nombreEvento,
          tipo: reservacion.tipoEvento,
          fecha: reservacion.fechaEvento,
          horaInicio: reservacion.horaInicio,
          horaFin: reservacion.horaFin,
          participantes: reservacion.numeroAsistentesEstimado,
          solicitante: usuario.nombre,
          departamento: usuario.departamento?.nombre || 'N/A',
          emailSolicitante: usuario.email,
          nombreSala: sala.nombreSala,
          ubicacionSala: sala.ubicacion || 'Edificio principal',
          observaciones: reservacion.observaciones,
          linkAprobacion: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/aprobar-reservacion?token=${reservacion.numeroReservacion}&accion=aprobar`,
          linkRechazo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/aprobar-reservacion?token=${reservacion.numeroReservacion}&accion=rechazar`,
          fechaLimite: fechaLimite.toLocaleDateString('es-ES'),
        });

        await this.resend.emails.send({
          from: process.env.SEND_EMAIL_FROM || 'telematica@isyte.dev',
          to: responsable.email,
          subject: `Solicitud de Aprobación - ${reservacion.nombreEvento}`,
          html: htmlContent,
        });

      }
    } catch (error) {
      console.error('Error al enviar email de aprobación:', error.message);
    }
  }

  /**
   * Approve or reject a reservation
   */
  async procesarAprobacion(accionDto: AccionAprobacion) {
    const { numeroReservacion, accion, motivo, idUsuarioAprobador } = accionDto;

    try {
      const reservacion = await this.prisma.reservaciones.findUnique({
        where: { numeroReservacion },
        include: {
          usuario: { include: { departamento: true } },
          sala: { include: { departamento: true } },
        },
      });

      if (!reservacion) {
        throw new BadRequestException('Reservación no encontrada');
      }

      if (reservacion.estadoSolicitud !== 'Pendiente') {
        throw new BadRequestException('La reservación ya ha sido procesada');
      }

      // Verify approver has permission
      const aprobador = await this.prisma.usuarios.findUnique({
        where: { id: idUsuarioAprobador },
        include: { rol: true },
      });

      if (!aprobador) {
        throw new BadRequestException('Usuario aprobador no encontrado');
      }

      const puedeAprobar =
        aprobador.id_rol === 1 || // Admin
        (aprobador.id_rol === 4 &&
          aprobador.id_departamento === reservacion.sala.idDepartamento); // Jefe del departamento responsable

      if (!puedeAprobar) {
        throw new BadRequestException(
          'No tiene permisos para aprobar esta reservación',
        );
      }

      // Update reservation status
      const nuevoEstado = accion === 'aprobar' ? 'Aprobada' : 'Rechazada';

      const reservacionActualizada = await this.prisma.reservaciones.update({
        where: { numeroReservacion },
        data: {
          estadoSolicitud: nuevoEstado,
          fechaUltimaModificacion: new Date(),
          idUsuarioUltimaModificacion: idUsuarioAprobador,
        },
      });

      // Create history record
      await this.prisma.historialReservaciones.create({
        data: {
          idReservacion: reservacion.id,
          accionRealizada: accion === 'aprobar' ? 'Aprobación' : 'Rechazo',
          idUsuario: idUsuarioAprobador,
          fechaAccion: new Date(),
          detalles:
            motivo ||
            `Reservación ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} por ${aprobador.nombre}`,
        },
      });

      // Send notification to user about approval/rejection
      await this.enviarNotificacionDecision(reservacion, accion, motivo);

      return {
        message: `Reservación ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`,
        data: reservacionActualizada,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al procesar aprobación: ${error.message}`,
      );
    }
  }

  /**
   * Send notification to user about approval decision
   */
  async enviarNotificacionDecision(
    reservacion: any,
    accion: 'aprobar' | 'rechazar',
    motivo?: string,
  ) {
    try {
      if (!this.resend) {
        console.log(
          'Resend no está configurado. Saltando notificación de decisión.',
        );
        return;
      }

      if (accion === 'aprobar') {
        // Send final confirmation to user
        await this.enviarConfirmacionFinal(reservacion);

        // Send notification to assigned technician
        const tecnico = await this.prisma.tecnicos.findUnique({
          where: { id: reservacion.sala.idTecnicoResponsable },
          include: { usuario: true },
        });

        if (tecnico && tecnico.usuario) {
          await this.enviarNotificacionTecnico(
            reservacion,
            tecnico,
            reservacion.usuario,
            reservacion.sala,
          );
        }
      } else {
        // Send rejection notification
        const subject = `❌ Reservación Rechazada - ${reservacion.nombreEvento}`;
        const mensaje = `Su solicitud de reservación ha sido rechazada. ${
          motivo ? `Motivo: ${motivo}` : ''
        }`;

        await this.resend.emails.send({
          from: process.env.SEND_EMAIL_FROM || 'telematica@isyte.dev',
          to: reservacion.usuario.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
              <h2 style="color: #dc2626">❌ Reservación Rechazada</h2>
              <p>Estimado/a ${reservacion.usuario.nombre},</p>
              <p>${mensaje}</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>Detalles de la reservación:</h3>
                <ul>
                  <li><strong>Número:</strong> ${reservacion.numeroReservacion}</li>
                  <li><strong>Evento:</strong> ${reservacion.nombreEvento}</li>
                  <li><strong>Fecha:</strong> ${reservacion.fechaEvento.toLocaleDateString('es-ES')}</li>
                  <li><strong>Sala:</strong> ${reservacion.sala.nombreSala}</li>
                </ul>
              </div>
              <p>Atentamente,<br/>Equipo de Telemática</p>
            </div>
          `,
        });
      }

    } catch (error) {
      console.error(
        'Error al enviar notificación de decisión:',
        error.message,
      );
    }
  }

  /**
   * Send pending confirmation email to user (before approval)
   */
  async enviarConfirmacionPendiente(
    usuario: any,
    reservacion: CreateReservacioneDto,
    sala: any,
  ) {
    try {
      if (!this.resend) {
        console.log('Resend no está configurado. Saltando envío de email.');
        return;
      }

      const templatePath = path.join(
        __dirname,
        '..',
        'template',
        'correo_cicese_formato.hbs',
      );

      const templateHtml = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateHtml);

      const htmlContent = template({
        name: usuario.nombre,
        numeroReservacion: reservacion.numeroReservacion,
        nombreEvento: reservacion.nombreEvento,
        tipo: reservacion.tipoEvento,
        fecha: reservacion.fechaEvento,
        horaInicio: reservacion.horaInicio,
        horaFin: reservacion.horaFin,
        participantes: reservacion.asistentes,
        solicitante: usuario.nombre || 'Usuario',
        departamento: usuario.departamento?.nombre || 'N/A',
        emailSolicitante: usuario.email,
        nombreSala: sala.nombreSala || 'Sala asignada',
        ubicacionSala: sala.ubicacion || 'Edificio principal',
        observaciones: reservacion.observaciones,
      });

      await this.resend.emails.send({
        from: process.env.SEND_EMAIL_FROM || 'telematica@isyte.dev',
        to: usuario.email,
        subject: 'Solicitud de Reservación Recibida - Pendiente de Aprobación',
        html: htmlContent,
      });

    } catch (error) {
      console.error(
        'Error al enviar email de confirmación pendiente:',
        error.message,
      );
    }
  }

  /**
   * Send final confirmation email to user (after approval)
   */
  async enviarConfirmacionFinal(reservacion: any) {
    try {
      if (!this.resend) {
        console.log(
          'Resend no está configurado. Saltando confirmación final.',
        );
        return;
      }

      const templatePath = path.join(
        __dirname,
        '..',
        'template',
        'correo_cicese_formato.hbs',
      );

      const templateHtml = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateHtml);

      const htmlContent = template({
        esConfirmacionFinal: true,
        name: reservacion.usuario.nombre,
        numeroReservacion: reservacion.numeroReservacion,
        nombreEvento: reservacion.nombreEvento,
        tipo: reservacion.tipoEvento,
        fecha: reservacion.fechaEvento.toLocaleDateString('es-ES'),
        horaInicio: reservacion.horaInicio.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        horaFin: reservacion.horaFin.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        participantes: reservacion.numeroAsistentesEstimado,
        solicitante: reservacion.usuario.nombre,
        departamento: reservacion.usuario.departamento?.nombre || 'N/A',
        emailSolicitante: reservacion.usuario.email,
        nombreSala: reservacion.sala.nombreSala,
        ubicacionSala: reservacion.sala.ubicacion || 'Edificio principal',
        observaciones: reservacion.observaciones,
        linkZoom: reservacion.linkReunionOnline,
      });

      await this.resend.emails.send({
        from: process.env.SEND_EMAIL_FROM || 'telematica@isyte.dev',
        to: reservacion.usuario.email,
        subject: `Reservación Confirmada - ${reservacion.nombreEvento}`,
        html: htmlContent,
      });

    } catch (error) {
      console.error('Error al enviar confirmación final:', error.message);
    }
  }

  /**
   * Get pending approval requests for a user
   */
  async obtenerSolicitudesPendientes(
    idUsuario: number,
  ): Promise<SolicitudAprobacion[]> {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id: idUsuario },
      include: { rol: true },
    });

    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Build where condition based on user role
    let whereCondition: any = { estadoSolicitud: 'Pendiente' };

    if (usuario.id_rol === 1) {
      // Admin can see all pending requests
    } else if (usuario.id_rol === 4) {
      // Department head can only see requests for their department's rooms
      whereCondition.sala = {
        idDepartamento: usuario.id_departamento,
      };
    } else {
      // Regular users can't see approval requests
      return [];
    }

    const solicitudes = await this.prisma.reservaciones.findMany({
      where: whereCondition,
      include: {
        usuario: { include: { departamento: true } },
        sala: { include: { departamento: true } },
      },
      orderBy: { fechaCreacionSolicitud: 'desc' },
    });

    return solicitudes.map((reservacion) => ({
      id: reservacion.id,
      numeroReservacion: reservacion.numeroReservacion,
      nombreEvento: reservacion.nombreEvento,
      tipoEvento: reservacion.tipoEvento,
      fechaEvento: reservacion.fechaEvento,
      horaInicio: reservacion.horaInicio,
      horaFin: reservacion.horaFin,
      solicitante: {
        nombre: reservacion.usuario.nombre,
        email: reservacion.usuario.email,
        departamento: reservacion.usuario.departamento?.nombre || 'N/A',
      },
      sala: {
        nombre: reservacion.sala.nombreSala,
        ubicacion: reservacion.sala.ubicacion || 'N/A',
      },
      departamentoResponsable: {
        id: reservacion.sala.departamento?.id || 0,
        nombre: reservacion.sala.departamento?.nombre || 'N/A',
      },
      observaciones: reservacion.observaciones ?? undefined,
    }));
  }

  async obtenerReservaciones() {
    return this.prisma.reservaciones.findMany();
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
  /**
   * Send notification to assigned technician (only after approval)
   */
  async enviarNotificacionTecnico(
    reservacion: any,
    tecnico: any,
    usuario: any,
    sala: any,
  ) {
    try {
      if (!this.resend) {
        console.log(
          'Resend no está configurado. Saltando notificación a técnico.',
        );
        return;
      }

      const templatePath = path.join(
        __dirname,
        '..',
        'template',
        'correo_cicese_formato.hbs',
      );

      const templateHtml = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateHtml);

      const htmlContent = template({
        esTecnico: true,
        nombreTecnico: tecnico.usuario.nombre,
        numeroReservacion: reservacion.numeroReservacion,
        nombreEvento: reservacion.nombreEvento,
        tipo: reservacion.tipoEvento,
        fecha: reservacion.fechaEvento.toLocaleDateString('es-ES'),
        horaInicio: reservacion.horaInicio.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        horaFin: reservacion.horaFin.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        participantes: reservacion.numeroAsistentesEstimado,
        solicitante: usuario.nombre,
        departamento: usuario.departamento?.nombre || 'N/A',
        emailSolicitante: usuario.email,
        nombreSala: sala.nombreSala,
        ubicacionSala: sala.ubicacion || 'Edificio principal',
        observaciones: reservacion.observaciones,
        especialidadTecnico: tecnico.especialidad || 'General',
      });

      await this.resend.emails.send({
        from: process.env.SEND_EMAIL_FROM || 'telematica@isyte.dev',
        to: tecnico.usuario.email,
        subject: `🔧 Asignación Técnica Confirmada - ${reservacion.nombreEvento}`,
        html: htmlContent,
      });

    } catch (error) {
      console.error('Error al enviar notificación a técnico:', error.message);
    }
  }
}
