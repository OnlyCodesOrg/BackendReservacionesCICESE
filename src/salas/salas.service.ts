import { Injectable } from '@nestjs/common';

type Sala = {
    id: number,
    inicio: Date,
    fin: Date
}
@Injectable()
export class SalasService {
    constructor() { }

    /**
     * Obtiene las salas disponibles dentro de un rango de fechas
     * @param fechaInicio 
     * @param fechaFin 
     * @param salasSeleccionadas
     * @returns La lista de salas disponibles dentro del rango de tiempo
     */
    ObtenerSalas(fechaInicio: Date, fechaFin: Date, salasSeleccionadas?: number[]) {
        const sala1: Sala = {
            id: 1,
            inicio: new Date("2025-05-10T00:00:00Z"),
            fin: new Date("2025-05-11T00:00:00Z")
        }
        const sala2: Sala = {
            id: 2,
            inicio: new Date("2025-06-10T00:00:00Z"),
            fin: new Date("2025-06-11T00:00:00Z")
        }
        const sala3: Sala = {
            id: 3,
            inicio: new Date("2025-06-20T00:00:00Z"),
            fin: new Date("2025-06-21T00:00:00Z")
        }
        const salas = [sala1, sala2, sala3];

        let salasDisponibles;
        // Si hay salas seleccionadas por el usuario
        if (salasSeleccionadas && salasSeleccionadas.length > 0) {
            // Filtrar salas dentro del rango
            salasDisponibles = salas.filter(current => current.inicio >= fechaInicio && current.fin <= fechaFin);

            // Filtrar salas seleccionadas
            let salasFiltradas = new Array<any>;
            salasSeleccionadas.forEach((currentSelected) => {
                salasDisponibles.forEach((currentDisp) => {
                    if(currentSelected === currentDisp.id){
                        salasFiltradas.push(currentDisp);
                    }
                })
            })
            return salasFiltradas;
        } else {
            salasDisponibles = salas.filter(current => current.inicio >= fechaInicio && current.fin <= fechaFin);
            return salasDisponibles;
        }
    }
}
