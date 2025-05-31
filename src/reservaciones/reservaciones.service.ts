import { Injectable } from '@nestjs/common';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';

/**
 * @description Servicio para manejar las reservaciones
 * @param createReservacioneDto
 * @return Reservación creada
 */

@Injectable()
export class ReservacionesService {
  crearReservacion(createReservacioneDto: CreateReservacioneDto) {
    const reservacionnes: CreateReservacioneDto = { ...createReservacioneDto };
    return reservacionnes;
  }
}
