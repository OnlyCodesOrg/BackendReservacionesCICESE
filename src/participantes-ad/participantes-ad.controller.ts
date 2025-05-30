import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ParticipantesAdService } from './participantes-ad.service';
import { CreateParticipantesAdDto } from './dto/create-participantes-ad.dto';
import { UpdateParticipantesAdDto } from './dto/update-participantes-ad.dto';

@Controller('participantes-ad')
export class ParticipantesAdController {
  constructor(
    private readonly participantesAdService: ParticipantesAdService,
  ) {}

  @Post('/agregarParticipante')
  create(@Body() createParticipantesAdDto: CreateParticipantesAdDto) {
    return this.participantesAdService.agregarParticipante(
      createParticipantesAdDto,
    );
  }
}
