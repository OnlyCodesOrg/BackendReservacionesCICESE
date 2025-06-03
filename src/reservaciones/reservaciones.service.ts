import { Injectable } from '@nestjs/common';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TipoRecurrencia } from 'generated/prisma';

/**
 * @description Servicio para manejar las reservaciones
 * @param createReservacioneDto
 * @return Reservación creada
 */

@Injectable()
export class ReservacionesService {
  constructor(private prisma: PrismaService) {}

  crearReservacion(createReservacioneDto: CreateReservacioneDto) {
    const reservacionnes: CreateReservacioneDto = { ...createReservacioneDto };
    return reservacionnes;
  }

  async obtenerReservaciones() {
    return await this.prisma.reservaciones.findMany();
  }

  async reservacionesAnteriores(idUsuario: number) {
    const historial = await this.prisma.reservaciones.findMany({
      where: {
        idUsuario: idUsuario,
      },
    });

    if (historial.length === 0) {
      return {
        message: 'Lo sentimos, no tienes reservaciones anteriores',
        data: [],
      };
    }

    return historial.map((reservacion) => ({
      numeroSolicitud: reservacion.numeroReservacion,
      nombreEvento: reservacion.nombreEvento,
      salaEvento: reservacion.idSala,
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
