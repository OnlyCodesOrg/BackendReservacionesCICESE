import { Injectable } from '@nestjs/common';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
