import { Module } from '@nestjs/common';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReservacionesModule } from '../reservaciones/reservaciones.module';

@Module({
  imports: [PrismaModule, ReservacionesModule],
  controllers: [SalasController],
  providers: [SalasService],
})
export class SalasModule {}
