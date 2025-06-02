// src/reservaciones/reservaciones.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';

@Injectable()
export class ReservacionesService {
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
      console.log('   ↪️ insertando en la BD remota, preparación de fechas/hora...');
      const horaInicioDate = new Date(`1970-01-01T${horaInicio}:00`);
      const horaFinDate = new Date(`1970-01-01T${horaFin}:00`);

      const nueva = await this.prisma.reservaciones.create({
        data: {
          numeroReservacion: numeroReservacion,
          idUsuario: idUsuario,
          idSala: idSala,
          nombreEvento: nombreEvento,
          tipoEvento: tipoEvento,                   // Prisma acepta este string como enum
          fechaEvento: new Date(fechaEvento),       // convierte ISO string a Date
          horaInicio: horaInicioDate,               // guarda solo hora (Time)
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
       console.error('   ❌ Error al crear reservación en BD remota:', e.message);
      throw new BadRequestException(
        'No se pudo crear la reservación: ' + e.message,
      );
    }
  }

  async obtenerReservaciones() {
    return this.prisma.reservaciones.findMany();
  }
}
