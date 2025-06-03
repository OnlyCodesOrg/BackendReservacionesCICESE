import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateParticipantesAdDto } from './dto/create-participantes-ad.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';
import { throwError } from 'rxjs';
/**
 * @description Servicio para manejar los participantes de anuncios
 * @param createParticipantesAdDto
 * @return Participante creado
 */

@Injectable()
export class ParticipantesAdService {
  private readonly logger = new Logger(ParticipantesAdService.name);

  constructor(private readonly prisma: PrismaService) {}

  async agregarParticipante(
    createParticipantesAdDto: CreateParticipantesAdDto,
  ) {
    const participante = createParticipantesAdDto;

    const existReservacion = !!(await this.prisma.reservaciones.findUnique({
      where: { id: participante.idReservacion },
    }));
    if (!existReservacion) {
      throw new HttpException(
        `La reservación con id ${participante.idReservacion} no existe`,
        HttpStatus.NOT_FOUND,
      );
    }

    const existParticipante =
      await this.prisma.partcipantesAdicionales.findFirst({
        where: {
          idReservacion: participante.idReservacion,
          email: participante.email,
        },
      });

    if (existParticipante) {
      throw new HttpException(
        `El participante con email ${participante.email} ya existe en esta reservación`,
        HttpStatus.CONFLICT,
      );
    }

    
    return this.prisma.partcipantesAdicionales.create({
      data: {
        idReservacion: participante.idReservacion,
        nombre: participante.nombre,
        email: participante.email,
      },
    });
  }
}
