// src/reservaciones/reservaciones.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';

@Controller('reservaciones')
export class ReservacionesController {
  constructor(private readonly reservacionesService: ReservacionesService) {}

  @Post('/crear')
  async create(@Body() createReservacioneDto: CreateReservacioneDto) {
    return await this.reservacionesService.crearReservacion(createReservacioneDto);
  }
}
