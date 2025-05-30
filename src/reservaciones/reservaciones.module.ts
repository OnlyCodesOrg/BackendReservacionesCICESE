import { Module } from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { ReservacionesController } from './reservaciones.controller';

@Module({
  controllers: [ReservacionesController],
  providers: [ReservacionesService],
})
export class ReservacionesModule {}
