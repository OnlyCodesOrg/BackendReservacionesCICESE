import { ApiProperty, PartialType } from '@nestjs/swagger';
import { EquipoSala } from '../../entities/EquipoSala.entity';
import { EstadoEquipo } from 'generated/prisma';

export class actualizarEquipo {
    @ApiProperty({ description: 'el id del equipo de la sala' })
    id: number;

    @ApiProperty({
        description:
            'Atributo opcional para actualzar el nombre del equipo en la tabla tiposDeEquipo',
    })
    nombre: string;

    @ApiProperty({
        description:
            'Atributo opcional para actualzar la cantidad del equipo en la sala',
    })
    cantidad: number;

    @ApiProperty({
        description: 'Atributo opcional para actualzar el estado del equipo',
    })
    estado: EstadoEquipo;
}
