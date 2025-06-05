import { PartialType } from '@nestjs/swagger';
import { EquipoSala } from '../../entities/EquipoSala.entity';

export class actualizarEquipo extends PartialType(EquipoSala) {}
