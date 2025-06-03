import { Module } from '@nestjs/common';
import { ParticipantesAdService } from './participantes-ad.service';
import { ParticipantesAdController } from './participantes-ad.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParticipantesAdController],
  providers: [ParticipantesAdService],
})
export class ParticipantesAdModule {}
