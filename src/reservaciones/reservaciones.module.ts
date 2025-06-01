import { Module } from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { ReservacionesController } from './reservaciones.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ReservacionesController],
  providers: [ReservacionesService, PrismaService],
  exports: [ReservacionesService],
})
export class ReservacionesModule {}
