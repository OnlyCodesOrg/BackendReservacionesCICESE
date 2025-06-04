import { ApiProperty } from "@nestjs/swagger"

export class listarSalas {
    @ApiProperty({description:"Inicio de la fecha"})
    inicioFecha: Date
    @ApiProperty({description:"Fin de la fecha"})
    finFecha: Date
    @ApiProperty({description:"Array de id de salas",example:[1,2,3,4]})
    salasSeleccionadas: number[]
}