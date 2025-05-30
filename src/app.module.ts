import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalasModule } from './salas/salas.module';

import { ReservacionesModule } from './reservaciones/reservaciones.module';
import { ParticipantesAdModule } from './participantes-ad/participantes-ad.module';

@Module({
  imports: [ReservacionesModule,SalasModule, ParticipantesAdModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
