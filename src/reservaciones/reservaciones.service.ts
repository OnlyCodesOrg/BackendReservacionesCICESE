import { Injectable } from '@nestjs/common';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';
import { UpdateReservacioneDto } from './dto/update-reservacione.dto';

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
