import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  // Clean up existing data
  await prisma.$transaction([
    prisma.historialReservaciones.deleteMany(),
    prisma.reservacionServiciosSolicitados.deleteMany(),
    prisma.reservacionEquiposSolicitados.deleteMany(),
    prisma.partcipantesAdicionales.deleteMany(),
    prisma.reservaciones.deleteMany(),
    prisma.equiposSala.deleteMany(),
    prisma.disponibilidadTecnicos.deleteMany(),
    prisma.salas.deleteMany(),
    prisma.tecnicos.deleteMany(),
    prisma.usuarios.deleteMany(),
    prisma.tiposEquipo.deleteMany(),
    prisma.serviciosAdicionales.deleteMany(),
    prisma.departamentos.deleteMany(),
    prisma.roles.deleteMany(),
  ]);

  // Reset sequences
  await prisma.$executeRaw`SELECT setval('"Roles_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"Departamentos_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"Usuarios_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"Tecnicos_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"DisponibilidadTecnicos_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"Salas_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"TiposEquipo_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"EquiposSala_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"ServiciosAdicionales_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"Reservaciones_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"ParticipantesAdicionales_id_seq"', 1, false);`;
  await prisma.$executeRaw`SELECT setval('"HistorialReservaciones_id_seq"', 1, false);`;

  // Create Roles
  const roles = await Promise.all([
    prisma.roles.create({
      data: { nombre: 'Administrador' },
    }),
    prisma.roles.create({
      data: { nombre: 'Técnico' },
    }),
    prisma.roles.create({
      data: { nombre: 'Usuario' },
    }),
    prisma.roles.create({
      data: { nombre: 'Jefe de Departamento' },
    }),
  ]);

  // Create Departamentos
  const departamentos = await Promise.all([
    prisma.departamentos.create({
      data: { nombre: 'Telemática' },
    }),
    prisma.departamentos.create({
      data: { nombre: 'Ciencias de la Computación' },
    }),
    prisma.departamentos.create({
      data: { nombre: 'Electrónica y Telecomunicaciones' },
    }),
  ]);

  // Create Usuarios
  const usuarios = await Promise.all([
    // Admin
    prisma.usuarios.create({
      data: {
        nombre: 'Admin',
        apellidos: 'Sistema',
        email: 'admin@cicese.mx',
        contraseña: await hashPassword('admin123'),
        id_rol: roles[0].id,
        id_departamento: departamentos[0].id,
      },
    }),
    // Técnico
    prisma.usuarios.create({
      data: {
        nombre: 'Juan',
        apellidos: 'Pérez',
        email: 'jperez@cicese.mx',
        contraseña: await hashPassword('tecnico123'),
        id_rol: roles[1].id,
        id_departamento: departamentos[0].id,
      },
    }),
    // Usuario Regular
    prisma.usuarios.create({
      data: {
        nombre: 'Zarina',
        apellidos: 'Talamantes',
        email: 'ztalamentes@cicese.mx',
        contraseña: await hashPassword('user123'),
        id_rol: roles[2].id,
        id_departamento: departamentos[1].id,
      },
    }),
    // Jefe de Departamento
    prisma.usuarios.create({
      data: {
        nombre: 'Juan',
        apellidos: 'Aguilar',
        email: 'jaguilar@cicese.mx',
        contraseña: await hashPassword('jefe123'),
        id_rol: roles[3].id,
        id_departamento: departamentos[1].id,
      },
    }),
  ]);

  // Create Tecnicos
  const tecnicos = await Promise.all([
    prisma.tecnicos.create({
      data: {
        idUsuario: usuarios[1].id,
        especialidad: 'Soporte Técnico',
      },
    }),
  ]);

  // Create DisponibilidadTecnicos
  await Promise.all([
    prisma.disponibilidadTecnicos.create({
      data: {
        idTecnico: tecnicos[0].id,
        diaSemana: 'Lunes',
        horaInicio: new Date('2025-06-03T09:00:00'),
        horaFin: new Date('2025-06-03T17:00:00'),
      },
    }),
    prisma.disponibilidadTecnicos.create({
      data: {
        idTecnico: tecnicos[0].id,
        diaSemana: 'Martes',
        horaInicio: new Date('2025-06-03T09:00:00'),
        horaFin: new Date('2025-06-03T17:00:00'),
      },
    }),
  ]);

  // Create Salas
  const salas = await Promise.all([
    prisma.salas.create({
      data: {
        nombreSala: 'Sala de Videoconferencias A',
        idDepartamento: departamentos[0].id,
        idTecnicoResponsable: tecnicos[0].id,
        ubicacion: 'Edificio Principal, Piso 1',
        capacidadMin: 5,
        capacidadMax: 20,
        notas: 'Sala equipada para videoconferencias',
      },
    }),
    prisma.salas.create({
      data: {
        nombreSala: 'Sala de Reuniones B',
        idDepartamento: departamentos[1].id,
        idTecnicoResponsable: tecnicos[0].id,
        ubicacion: 'Edificio Principal, Piso 2',
        capacidadMin: 3,
        capacidadMax: 15,
        notas: 'Sala para reuniones pequeñas',
      },
    }),
  ]);

  // Create TiposEquipo
  const tiposEquipo = await Promise.all([
    prisma.tiposEquipo.create({
      data: {
        nombre: 'Proyector',
        descripcion: 'Proyector HD',
        marca: 'Epson',
        modelo: 'PowerLite 2250U',
        año: 2023,
      },
    }),
    prisma.tiposEquipo.create({
      data: {
        nombre: 'Cámara Web',
        descripcion: 'Cámara web HD para videoconferencias',
        marca: 'Logitech',
        modelo: 'C920',
        año: 2023,
      },
    }),
  ]);

  // Create EquiposSala
  await Promise.all([
    prisma.equiposSala.create({
      data: {
        idSala: salas[0].id,
        idTipoEquipo: tiposEquipo[0].id,
        cantidad: 1,
        estado: 'Operativo',
        numeroSerie: 'PRJ-001',
        fechaAdquisicion: new Date('2025-01-15'),
        ultimaRevision: new Date('2025-05-15'),
      },
    }),
    prisma.equiposSala.create({
      data: {
        idSala: salas[0].id,
        idTipoEquipo: tiposEquipo[1].id,
        cantidad: 2,
        estado: 'Operativo',
        numeroSerie: 'CAM-001',
        fechaAdquisicion: new Date('2025-02-01'),
        ultimaRevision: new Date('2025-05-20'),
      },
    }),
  ]);

  // Create ServiciosAdicionales
  const serviciosAdicionales = await Promise.all([
    prisma.serviciosAdicionales.create({
      data: {
        nombre: 'Soporte Técnico Presencial',
        descripcion: 'Asistencia técnica durante el evento',
        costo: 0,
      },
    }),
    prisma.serviciosAdicionales.create({
      data: {
        nombre: 'Grabación de Sesión',
        descripcion: 'Grabación profesional del evento',
        costo: 0,
      },
    }),
  ]);

  // Create test reservations for approval workflow
  const reservaciones = await Promise.all([
    prisma.reservaciones.create({
      data: {
        numeroReservacion: 'RES-2025-001',
        idUsuario: usuarios[2].id,
        idTecnicoAsignado: tecnicos[0].id,
        idSala: salas[0].id,
        nombreEvento: 'Reunión de Proyecto',
        tipoEvento: 'Reunion',
        fechaEvento: new Date('2025-06-05'),
        horaInicio: new Date('2025-06-05T10:00:00'),
        horaFin: new Date('2025-06-05T12:00:00'),
        numeroAsistentesEstimado: 10,
        estadoSolicitud: 'Pendiente',
        tipoRecurrencia: 'Unica',
        observaciones: 'Reunión importante de proyecto',
        fechaCreacionSolicitud: new Date('2025-06-03'),
      },
    }),
    prisma.reservaciones.create({
      data: {
        numeroReservacion: 'RES-2025-002',
        idUsuario: usuarios[2].id,
        idTecnicoAsignado: tecnicos[0].id,
        idSala: salas[1].id,
        nombreEvento: 'Conferencia Anual',
        tipoEvento: 'Conferencia',
        fechaEvento: new Date('2025-06-10'),
        horaInicio: new Date('2025-06-10T09:00:00'),
        horaFin: new Date('2025-06-10T17:00:00'),
        numeroAsistentesEstimado: 50,
        estadoSolicitud: 'Pendiente',
        tipoRecurrencia: 'Unica',
        observaciones: 'Evento anual del departamento',
        fechaCreacionSolicitud: new Date('2025-06-03'),
      },
    }),
  ]);

  // Create ParticipantesAdicionales for the first reservacion
  await prisma.partcipantesAdicionales.create({
    data: {
      idReservacion: reservaciones[0].id,
      nombre: 'Daniel LoInsano',
      email: 'tilin@cicese.mx',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
