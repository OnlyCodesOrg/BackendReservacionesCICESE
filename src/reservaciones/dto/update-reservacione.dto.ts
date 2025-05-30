import { PartialType } from '@nestjs/mapped-types';
import { CreateReservacioneDto } from './create-reservacione.dto';

export class UpdateReservacioneDto extends PartialType(CreateReservacioneDto) {}
