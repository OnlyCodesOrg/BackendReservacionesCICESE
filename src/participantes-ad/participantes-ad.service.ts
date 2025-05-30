import { Injectable } from '@nestjs/common';
import { CreateParticipantesAdDto } from './dto/create-participantes-ad.dto';
/**
 * @description Servicio para manejar los participantes de anuncios
 * @param createParticipantesAdDto
 * @return Participante creado
 */

@Injectable()
export class ParticipantesAdService {
  agregarParticipante(createParticipantesAdDto: CreateParticipantesAdDto) {
    const participante: CreateParticipantesAdDto = {
      ...createParticipantesAdDto,
    };
    return participante;
  }
}
