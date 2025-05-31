import { Injectable } from '@nestjs/common';
import { SalaDisponible, ConflictoHorario, Reservacion } from '../types';
import { ReservacionesService } from 'src/reservaciones/reservaciones.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalasService {
  constructor(
    private prisma: PrismaService,
    private reservacionesService: ReservacionesService,
  ) {}

  /**
   * Obtiene las salas disponibles dentro de un rango de fechas
   * @param fechaInicio
   * @param fechaFin
   * @param salasSeleccionadas
   * @returns La lista de salas disponibles dentro del rango de tiempo
   */
  ObtenerSalas(
    fechaInicio: Date,
    fechaFin: Date,
    salasSeleccionadas?: number[],
  ) {
    const sala1: SalaDisponible = {
      id: 1,
      inicio: new Date('2025-05-10T00:00:00Z'),
      fin: new Date('2025-05-11T00:00:00Z'),
    };
    const sala2: SalaDisponible = {
      id: 2,
      inicio: new Date('2025-06-10T00:00:00Z'),
      fin: new Date('2025-06-11T00:00:00Z'),
    };
    const sala3: SalaDisponible = {
      id: 3,
      inicio: new Date('2025-06-20T00:00:00Z'),
      fin: new Date('2025-06-21T00:00:00Z'),
    };
    const salas = [sala1, sala2, sala3];

    let salasDisponibles;
    // Si hay salas seleccionadas por el usuario
    if (salasSeleccionadas && salasSeleccionadas.length > 0) {
      // Filtrar salas dentro del rango
      salasDisponibles = salas.filter(
        (current) => current.inicio >= fechaInicio && current.fin <= fechaFin,
      );

      // Filtrar salas seleccionadas
      let salasFiltradas = new Array<any>();
      salasSeleccionadas.forEach((currentSelected) => {
        salasDisponibles.forEach((currentDisp) => {
          if (currentSelected === currentDisp.id) {
            salasFiltradas.push(currentDisp);
          }
        });
      });
      return salasFiltradas;
    } else {
      salasDisponibles = salas.filter(
        (current) => current.inicio >= fechaInicio && current.fin <= fechaFin,
      );
      return salasDisponibles;
    }
  }

  /**
   * Valida si hay conflictos de horario para una reserva
   * @param idSala ID de la sala a validar
   * @param fechaEvento Fecha del evento
   * @param horaInicio Hora de inicio (formato HH:MM)
   * @param horaFin Hora de fin (formato HH:MM)
   * @returns Información sobre conflictos y sugerencias
   */
  async validarDisponibilidadSala(
    idSala: number,
    fechaEvento: Date,
    horaInicio: string,
    horaFin: string,
  ): Promise<ConflictoHorario> {
    // Obtener reservas existentes de la base de datos
    const reservasExistentes =
      await this.reservacionesService.obtenerReservaciones();

    // Convertir strings de hora a objetos Date para comparación
    const fechaEventoStr = fechaEvento.toISOString().split('T')[0];
    const inicioSolicitado = new Date(`${fechaEventoStr}T${horaInicio}:00Z`);
    const finSolicitado = new Date(`${fechaEventoStr}T${horaFin}:00Z`);

    // Buscar conflictos
    const conflictos = reservasExistentes.filter((reserva) => {
      return (
        reserva.idSala === idSala &&
        reserva.fechaEvento.toISOString().split('T')[0] === fechaEventoStr &&
        this.hayTraslapeHorario(
          inicioSolicitado,
          finSolicitado,
          reserva.horaInicio,
          reserva.horaFin,
        )
      );
    });

    if (conflictos.length > 0) {
      const primerConflicto = conflictos[0];
      return {
        hasConflict: true,
        conflictType: 'reserva_existente',
        conflictDetails: {
          nombreEvento: primerConflicto.nombreEvento,
          numeroReservacion: primerConflicto.numeroReservacion,
          horaInicio: primerConflicto.horaInicio.toTimeString().substr(0, 5),
          horaFin: primerConflicto.horaFin.toTimeString().substr(0, 5),
        },
        sugerencias: this.generarSugerenciasHorario(
          idSala,
          fechaEvento,
          reservasExistentes,
        ),
      };
    }

    return { hasConflict: false };
  }

  /**
   * Verifica si hay traslape entre dos rangos de horario
   */
  private hayTraslapeHorario(
    inicio1: Date,
    fin1: Date,
    inicio2: Date,
    fin2: Date,
  ): boolean {
    return inicio1 < fin2 && fin1 > inicio2;
  }

  /**
   * Genera sugerencias de horarios disponibles
   */
  private generarSugerenciasHorario(
    idSala: number,
    fechaEvento: Date,
    reservasExistentes: Reservacion[],
  ): { proximoHorarioDisponible?: string; alternativas: string[] } {
    // Filtrar reservas del día específico
    const fechaEventoStr = fechaEvento.toISOString().split('T')[0];
    const reservasDelDia = reservasExistentes
      .filter(
        (r) =>
          r.idSala === idSala &&
          r.fechaEvento.toISOString().split('T')[0] === fechaEventoStr,
      )
      .sort((a, b) => a.horaInicio.getTime() - b.horaInicio.getTime());

    const alternativas: string[] = [];

    // Sugerir horarios antes de la primera reserva
    if (reservasDelDia.length > 0) {
      const primeraReserva = reservasDelDia[0];
      if (primeraReserva.horaInicio.getHours() > 8) {
        alternativas.push(
          `08:00 - ${primeraReserva.horaInicio.toTimeString().substr(0, 5)}`,
        );
      }
    }

    // Sugerir horarios entre reservas
    for (let i = 0; i < reservasDelDia.length - 1; i++) {
      const finActual = reservasDelDia[i].horaFin;
      const inicioSiguiente = reservasDelDia[i + 1].horaInicio;

      const diferencia =
        (inicioSiguiente.getTime() - finActual.getTime()) / (1000 * 60); // minutos
      if (diferencia >= 60) {
        // Al menos 1 hora disponible
        alternativas.push(
          `${finActual.toTimeString().substr(0, 5)} - ${inicioSiguiente.toTimeString().substr(0, 5)}`,
        );
      }
    }

    // Sugerir horarios después de la última reserva
    if (reservasDelDia.length > 0) {
      const ultimaReserva = reservasDelDia[reservasDelDia.length - 1];
      if (ultimaReserva.horaFin.getHours() < 18) {
        alternativas.push(
          `${ultimaReserva.horaFin.toTimeString().substr(0, 5)} - 18:00`,
        );
      }
    }

    return {
      proximoHorarioDisponible: alternativas[0],
      alternativas,
    };
  }
}
