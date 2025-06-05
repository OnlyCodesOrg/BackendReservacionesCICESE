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
import {
  ApiTags,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('participantes-ad')
@ApiTags('Participantes Adicionales')
export class ParticipantesAdController {
  constructor(
    private readonly participantesAdService: ParticipantesAdService,
  ) {}

  @Post('agregar-articipante')
  @ApiOperation({
    summary: 'Agregar un participante adicional a una reservación',
    description:
      'Permite agregar un participante adicional a una reservación existente.',
  })
  @ApiBody({
    description: 'Datos del participante adicional. Entrar al Try it Out para editar los campos.',
    type: CreateParticipantesAdDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Participante adicional creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al crear el participante adicional',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservación no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'El participante ya existe en esta reservación',
  })
  @ApiConsumes('application/json')
  create(@Body() createParticipantesAdDto: CreateParticipantesAdDto) {
    return this.participantesAdService.agregarParticipante(
      createParticipantesAdDto,
    );
  }
}
