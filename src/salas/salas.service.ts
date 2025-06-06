import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  SalaDisponible,
  ConflictoHorario,
  Reservacion,
  SalaConHistorial,
  HistorialUsoSala,
  DetalleEventoSala,
  disponibilidadDeSala,
} from '../types';
import { ReservacionesService } from 'src/reservaciones/reservaciones.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarElementoInventarioDto } from './dto/actualizar-inventario.dto';
import { actualizarEquipo } from './dto/actualizar-equipo.dto';
import { respuestaGenerica } from './dto/respuesta-generica.dto';
import { Salas } from 'generated/prisma';

@Injectable()
export class SalasService {
  constructor(
    private prisma: PrismaService,
    private reservacionesService: ReservacionesService,
  ) { }

  /**
   *
   * @param fecha DIA del evento
   * @param horaInicio Hora en formato HH:MM
   * @param horaFin Hora en formato HH:MM
   * @param salasSeleccionadas Array opcional de salas seleccionadas [id,id]
   * @returns {message:'mensaje de error || ok, dat:'Un array con las salas disponibles' || null}
   */
  async ObtenerSalasDisponiblesPorHora(
    fecha: string,
    horaInicio: string,
    horaFin: string,
    salasSeleccionadas?: number[],
  ) {
    try {
      const dia = new Date(`${fecha}T00:00:00.000Z`);
      const horaInicioUTC = new Date(`1970-01-01T${horaInicio}:00.000Z`);
      const horaFinUTC = new Date(`1970-01-01T${horaFin}:00.000Z`);

      // Obtener reservaciones de ese día
      const resPorDia = await this.prisma.reservaciones.findMany({
        where: {
          fechaEvento: dia,
          ...(salasSeleccionadas?.length
            ? { idSala: { in: salasSeleccionadas } }
            : {}),
        },
      });

      // Filtrar reservaciones que se solapan con el rango de horas dado
      const resPorHora = resPorDia.filter((res) => {
        const inicio = res.horaInicio;
        const fin = res.horaFin;
        return (
          inicio.getTime() < horaFinUTC.getTime() && // Empieza antes de que termine
          fin.getTime() > horaInicioUTC.getTime() // Termina después de que empieza
        );
      });

      const salasOcupadas = resPorHora.map((current) => current.idSala);

      const salasDisponibles = await this.prisma.salas.findMany({
        where: {
          AND: [
            ...(salasSeleccionadas?.length
              ? [{ id: { in: salasSeleccionadas } }]
              : []),
            { id: { notIn: salasOcupadas } },
          ],
        },
      });

      return { message: 'ok', data: salasDisponibles };
    } catch (e: any) {
      console.error(e);
      return { message: e.message, data: null };
    }
  }

  /**
   * Obtiene el equipo de la sala especificada, retorna un objeto con un message y data,
   * donde data puede ser null en caso de no encontrar algo
   * @param idSala id de la sala
   * @returns {message:"ok"|| error encontrad,data:[{equipo , detalles}] || null }
   */
  async ObtenerEquipoDeSala(idSala: number) {
    try {
      const equipo = await this.prisma.equiposSala.findMany({
        where: { idSala: idSala },
      });
      if (!equipo) throw new Error('Equipo no encontrado. ', equipo);

      const listaDeEquipo = await Promise.all(equipo.map(async (current) => {
        const tipoEquipo = await this.prisma.tiposEquipo.findUnique({ where: { id: current.idTipoEquipo } })
        return { equipo: current, detalles: tipoEquipo };
      }));

      return { message: 'ok', data: listaDeEquipo };
    } catch (e) {
      console.error(e.message);
      return { message: e.message, data: null };
    }
  }

  /**
   * Obtiene la sala por id
   * @param id Id de la sala
   * @returns {message:error|| ok, data:null||sala}
   */
  async ObtenerSalaPorId(id: number) {
    try {
      const sala = await this.prisma.salas.findUnique({ where: { id: id } });
      if (!sala) throw new Error("Sala no encontrada");
      return { message: "ok", data: sala };
    } catch (e) {
      console.error(e);
      return { message: e.message, data: null };
    }
  }

  /**
   * Actualiza los atributos del equipo
   * @param nuevoEquipo El equipo con sus datos a actualizar
   * @returns {message:ok || error, data:resultado||null}
   */
  async ActualizarEquipoDeSala(nuevoEquipo: actualizarEquipo) {
    try {
      const equipo = await this.prisma.equiposSala.findFirst({
        where: { id: nuevoEquipo.id },
      });
      if (!equipo) throw new Error('Equipo no encontrado.');

      const { id: _, ...equipoSinId } = nuevoEquipo;

      const res = await this.prisma.equiposSala.update({
        where: { id: equipo.id },
        data: equipoSinId,
      });
      if (!res) throw new Error('Error al actualizar el equipo. ', res);
      return { message: 'ok', data: res };
    } catch (e) {
      console.error(e.message);
      return { message: e.message, data: null };
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

  async consultarDisponibilidadSala(diaActual: Date): Promise<any[]> {
    const horaInicio = 8 * 60; //Convertir a minutos
    const horaFin = 18 * 60;

    // Se obtienen todas las salas
    const salas = await this.prisma.salas.findMany();

    // Se obtienen todas las reservaciones del dia
    const reservacionesDia = await this.prisma.reservaciones.findMany({
      where: {
        fechaEvento: diaActual,
      },
    });

    const salasDisponibles: disponibilidadDeSala[] = [];

    for (const sala of salas) {
      const salasReservadas = reservacionesDia
        .filter((r) => r.idSala === sala.id)
        .map((r) => ({
          inicio: r.horaInicio.getHours() * 60 + r.horaInicio.getMinutes(),
          fin: r.horaFin.getHours() * 60 + r.horaFin.getMinutes(),
        }))
        .sort((a, b) => a.inicio - b.inicio);

      let disponible = false;
      let anteriorFin = horaInicio;

      for (const reserva of salasReservadas) {
        if (reserva.inicio - anteriorFin >= 60) {
          disponible = true;
          break;
        }
        anteriorFin = Math.max(anteriorFin, reserva.fin);
      }

      if (!disponible && horaFin - anteriorFin >= 60) {
        disponible = true;
      }

      salasDisponibles.push({
        id: sala.id,
        nombreSala: sala.nombreSala,
        ubicacion: sala.ubicacion,
        estaDisponible: disponible,
      });
    }

    return salasDisponibles;
  }

  /**
   * Genera sugerencias de horarios disponibles
   */
  /**
   * Obtiene el inventario de una sala específica
   * @param idSala ID de la sala
   * @returns Información de la sala y su inventario
   */
  async obtenerInventarioSala(idSala: number) {
    // Verificar que la sala existe
    const sala = await this.prisma.salas.findUnique({
      where: { id: idSala },
      select: {
        id: true,
        nombreSala: true,
        ubicacion: true,
      },
    });

    if (!sala) {
      throw new NotFoundException(`Sala con ID ${idSala} no encontrada`);
    }

    // Obtener equipos asociados a la sala desde la tabla EquiposSala
    const equiposSala = await this.prisma.equiposSala.findMany({
      where: { idSala },
      include: {
        tipoEquipo: true,
      },
    });

    const inventarioMap = new Map<string, any>();

    const elementosInventario = [
      'Cámara',
      'Micrófono',
      'Pantalla',
      'Proyector',
      'Silla',
      'Mesa',
      'Pizarrón',
      'Plumón',
      'Borrador',
    ];

    elementosInventario.forEach((elemento) => {
      inventarioMap.set(elemento, {
        nombre: elemento,
        detalles: {
          Operativo: 0,
          Dañado: 0,
          NoOperativo: 0,
          EnMantenimiento: 0,
        },
      });
    });
    // Actualizar cantidades basadas en los equipos encontrados
    equiposSala.forEach((equipo) => {
      const nombreEquipo = equipo.tipoEquipo.nombre;
      for (const elemento of elementosInventario) {
        if (nombreEquipo.toLowerCase().includes(elemento.toLowerCase())) {
          const item = inventarioMap.get(elemento);
          if (item) {
            if (item.detalles[equipo.estado] !== undefined) {
              item.detalles[equipo.estado] += equipo.cantidad;
            } else {
              item.detalles[equipo.estado] = equipo.cantidad;
            }
          }
          break;
        }
      }
    });

    const inventario = Array.from(inventarioMap.values());

    return {
      sala,
      inventario,
    };
  }

  /**
   * Actualiza el inventario de una sala específica
   * @param idSala ID de la sala
   * @param elementos Lista de elementos del inventario a actualizar
   * @returns Información de la sala actualizada
   */
  async actualizarInventarioSala(
    idSala: number,
    elementos: ActualizarElementoInventarioDto[],
  ) {
    const sala = await this.prisma.salas.findUnique({
      where: { id: idSala },
      select: {
        id: true,
        nombreSala: true,
      },
    });

    if (!sala) {
      throw new NotFoundException(`Sala con ID ${idSala} no encontrada`);
    }

    const elementosInventario = [
      'Cámara',
      'Micrófono',
      'Pantalla',
      'Proyector',
      'Silla',
      'Mesa',
      'Pizarrón',
      'Plumón',
      'Borrador',
    ];
    const tiposEquipo = await this.prisma.tiposEquipo.findMany();
    console.log(
      'Tipos de equipo disponibles:',
      tiposEquipo.map((t) => t.nombre),
    );

    // Función para normalizar texto (eliminar acentos y convertir a minúsculas)
    const normalizar = (texto: string) => {
      return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    // Asegurarse de que todos los elementos del inventario existen como tipos de equipo
    for (const elementoNombre of elementosInventario) {
      const tipoExistente = tiposEquipo.find(
        (tipo) =>
          normalizar(tipo.nombre) === normalizar(elementoNombre) ||
          normalizar(tipo.nombre).includes(normalizar(elementoNombre)) ||
          normalizar(elementoNombre).includes(normalizar(tipo.nombre)),
      );

      if (!tipoExistente) {
        // Crear el tipo de equipo si no existe
        await this.prisma.tiposEquipo.create({
          data: {
            nombre: elementoNombre,
            descripcion: `Tipo de equipo para ${elementoNombre}`,
          },
        });
      }
    }

    // Recargar los tipos de equipo después de posibles creaciones
    const tiposEquipoActualizados = await this.prisma.tiposEquipo.findMany();

    for (const elemento of elementos) {
      // Verificar que el elemento está en la lista de elementos permitidos
      const elementoPermitido = elementosInventario.find(
        (e) => normalizar(e) === normalizar(elemento.nombre),
      );

      if (!elementoPermitido) {
        throw new BadRequestException(
          `El elemento '${elemento.nombre}' no está en la lista de elementos permitidos`,
        );
      }

      // Buscar el tipo de equipo correspondiente
      const tipoEquipo = tiposEquipoActualizados.find(
        (tipo) =>
          normalizar(tipo.nombre) === normalizar(elemento.nombre) ||
          normalizar(tipo.nombre).includes(normalizar(elemento.nombre)) ||
          normalizar(elemento.nombre).includes(normalizar(tipo.nombre)),
      );

      if (!tipoEquipo) {
        throw new NotFoundException(
          `Tipo de equipo '${elemento.nombre}' no encontrado`,
        );
      }

      const equipoExistente = await this.prisma.equiposSala.findFirst({
        where: {
          idSala,
          idTipoEquipo: tipoEquipo.id,
        },
      });

      if (equipoExistente) {
        // Actualizar el equipo existente
        await this.prisma.equiposSala.update({
          where: { id: equipoExistente.id },
          data: {
            cantidad: elemento.cantidad,
            estado: elemento.estado,
          },
        });
      } else {
        // Crear un nuevo registro de equipo para la sala
        await this.prisma.equiposSala.create({
          data: {
            idSala,
            idTipoEquipo: tipoEquipo.id,
            cantidad: elemento.cantidad,
            estado: elemento.estado,
          },
        });
      }
    }

    return {
      id: sala.id,
      nombreSala: sala.nombreSala,
    };
  }

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

  /**
   * Obtiene la lista de salas con información resumida de su historial de uso
   * @returns Lista de salas con estadísticas de uso
   */
  async obtenerSalasConHistorial(): Promise<SalaConHistorial[]> {
    // Obtener todas las salas
    const salas = await this.prisma.salas.findMany({
      include: {
        _count: {
          select: {
            reservaciones: {
              where: {
                estadoSolicitud: 'Aprobada',
              },
            },
          },
        },
        reservaciones: {
          where: {
            estadoSolicitud: 'Aprobada',
          },
          orderBy: {
            fechaEvento: 'desc',
          },
          take: 1,
          select: {
            fechaEvento: true,
          },
        },
      },
    });

    return salas.map((sala) => ({
      id: sala.id,
      nombreSala: sala.nombreSala,
      ubicacion: sala.ubicacion,
      capacidadMax: sala.capacidadMax,
      disponible: sala.disponible,
      totalEventos: sala._count.reservaciones,
      ultimoUso: sala.reservaciones[0]?.fechaEvento || null,
    }));
  }

  /**
   * Obtiene el historial completo de uso de una sala específica
   * @param idSala ID de la sala
   * @param limite Número máximo de registros a retornar (default: 50)
   * @param offset Offset para paginación (default: 0)
   * @returns Historial de eventos de la sala
   */
  async obtenerHistorialSala(
    idSala: number,
    limite: number = 50,
    offset: number = 0,
  ): Promise<HistorialUsoSala[]> {
    const reservaciones = await this.prisma.reservaciones.findMany({
      where: {
        idSala: idSala,
        estadoSolicitud: 'Aprobada',
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        equiposSolicitados: {
          include: {
            tipoEquipo: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaEvento: 'desc',
      },
      take: limite,
      skip: offset,
    });

    return reservaciones.map((reservacion) => ({
      id: reservacion.id,
      numeroReservacion: reservacion.numeroReservacion,
      nombreEvento: reservacion.nombreEvento,
      tipoEvento: reservacion.tipoEvento,
      fechaEvento: reservacion.fechaEvento,
      horaInicio: reservacion.horaInicio,
      horaFin: reservacion.horaFin,
      numeroAsistentesReal: reservacion.numeroAsistentesReal,
      responsableSala: {
        id: reservacion.usuario.id,
        nombre: reservacion.usuario.nombre,
        email: reservacion.usuario.email,
      },
      fallasRegistradas: reservacion.fallasRegistradas,
      equiposUsados: reservacion.equiposSolicitados.map((equipo) => ({
        nombre: equipo.tipoEquipo.nombre,
        cantidad: equipo.cantidad,
        estado: 'Solicitado', // Se podría extender con más información del estado
      })),
    }));
  }

  /**
   * Obtiene el detalle completo de un evento específico
   * @param idReservacion ID de la reservación
   * @returns Detalle completo del evento
   */
  async obtenerDetalleEvento(
    idReservacion: number,
  ): Promise<DetalleEventoSala | null> {
    const reservacion = await this.prisma.reservaciones.findUnique({
      where: { id: idReservacion },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        equiposSolicitados: {
          include: {
            tipoEquipo: {
              select: {
                nombre: true,
              },
            },
          },
        },
        participantesAdicionales: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        serviciosSolicitados: {
          include: {
            servicioAdicional: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!reservacion) {
      return null;
    }

    const historialReservacion: HistorialUsoSala = {
      id: reservacion.id,
      numeroReservacion: reservacion.numeroReservacion,
      nombreEvento: reservacion.nombreEvento,
      tipoEvento: reservacion.tipoEvento,
      fechaEvento: reservacion.fechaEvento,
      horaInicio: reservacion.horaInicio,
      horaFin: reservacion.horaFin,
      numeroAsistentesReal: reservacion.numeroAsistentesReal,
      responsableSala: {
        id: reservacion.usuario.id,
        nombre: reservacion.usuario.nombre,
        email: reservacion.usuario.email,
      },
      fallasRegistradas: reservacion.fallasRegistradas,
      equiposUsados: reservacion.equiposSolicitados.map((equipo) => ({
        nombre: equipo.tipoEquipo.nombre,
        cantidad: equipo.cantidad,
        estado: 'Solicitado',
      })),
    };

    return {
      reservacion: historialReservacion,
      participantes: reservacion.participantesAdicionales,
      serviciosAdicionales: reservacion.serviciosSolicitados.map(
        (servicio) => ({
          nombre: servicio.servicioAdicional.nombre,
          cantidad: servicio.cantidad,
        }),
      ),
    };
  }
}
