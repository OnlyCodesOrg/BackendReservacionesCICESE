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
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', description: 'Nombre del participante' },
        email: { type: 'string', description: 'Email del participante' },
        idReservacion: {
          type: 'number',
          description:
            'ID de la reservación a la que se agregará el participante',
        },
      },
    },
  })
  @ApiParam({
    name: 'nombre',
    description: 'Nombre del participante adicional',
    required: true,
  })
  @ApiParam({
    name: 'email',
    description: 'Email del participante adicional',
    required: true,
  })
  @ApiParam({
    name: 'idReservacion',
    description: 'ID de la reservación a la que se agregará el participante',
    required: true,
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
