import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { CreateReservacioneDto } from './dto/create-reservacione.dto';
import { UpdateReservacioneDto } from './dto/update-reservacione.dto';

@Controller('reservaciones')
export class ReservacionesController {
  constructor(private readonly reservacionesService: ReservacionesService) {}

  @Post('/crear')
  create(@Body() createReservacioneDto: CreateReservacioneDto) {
    return this.reservacionesService.crearReservacion(createReservacioneDto);
  }
}
