import { Controller, Get, Post, Patch, Body } from '@nestjs/common';
import { SalasService } from './salas.service';

@Controller('salas')
export class SalasController {
    constructor(private readonly salasService: SalasService) { }
    
    /**
     * Obtiene la lista de salas disponibles dentro del rango de fechas
     * @param fechas {inicio:Date, fin:Date, (Opcional) salasSeleccionadas?:[id,id,id...]}
     * @returns [salas]
     */
    @Post('listar')
    async ListarSalas(@Body() data) {
        const res = this.salasService.ObtenerSalas(new Date(data.inicio), new Date(data.fin),data.salasSeleccionadas );
        return { message: 'ok', data: res };
    }
}
