import { Module } from '@nestjs/common';
import { ParticipantesAdService } from './participantes-ad.service';
import { ParticipantesAdController } from './participantes-ad.controller';

@Module({
  controllers: [ParticipantesAdController],
  providers: [ParticipantesAdService],
})
export class ParticipantesAdModule {}
