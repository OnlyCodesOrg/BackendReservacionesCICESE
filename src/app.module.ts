import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SalasModule } from './salas/salas.module';

import { ReservacionesModule } from './reservaciones/reservaciones.module';
import { ParticipantesAdModule } from './participantes-ad/participantes-ad.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    ReservacionesModule,
    SalasModule,
    ParticipantesAdModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
