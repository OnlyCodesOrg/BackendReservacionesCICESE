/*
  Warnings:

  - The `estadoSolicitud` column on the `Reservaciones` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tipoRecurrencia` column on the `Reservaciones` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `PartcipantesAdicionales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `departamentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proyectos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `tipoEvento` on the `Reservaciones` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstadoSolicitudReservacion" AS ENUM ('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('Reunion', 'Videoconferencia', 'Presentacion', 'Capacitacion', 'Conferencia', 'Otro');

-- CreateEnum
CREATE TYPE "TipoRecurrencia" AS ENUM ('Unica', 'Diaria', 'Semanal', 'Mensual');

-- CreateEnum
CREATE TYPE "EstadoEquipo" AS ENUM ('Operativo', 'NoOperativo', 'EnMantenimiento', 'Dañado');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo');

-- DropForeignKey
ALTER TABLE "PartcipantesAdicionales" DROP CONSTRAINT "PartcipantesAdicionales_idReservacion_fkey";

-- DropForeignKey
ALTER TABLE "Reservaciones" DROP CONSTRAINT "Reservaciones_idTecnicoAsignado_fkey";

-- DropForeignKey
ALTER TABLE "Reservaciones" DROP CONSTRAINT "Reservaciones_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "Salas" DROP CONSTRAINT "Salas_idDepartamento_fkey";

-- DropForeignKey
ALTER TABLE "Salas" DROP CONSTRAINT "Salas_idTecnicoResponsable_fkey";

-- DropForeignKey
ALTER TABLE "proyectos" DROP CONSTRAINT "proyectos_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_id_departamento_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_id_rol_fkey";

-- AlterTable
ALTER TABLE "Reservaciones" DROP COLUMN "tipoEvento",
ADD COLUMN     "tipoEvento" "TipoEvento" NOT NULL,
DROP COLUMN "estadoSolicitud",
ADD COLUMN     "estadoSolicitud" "EstadoSolicitudReservacion" NOT NULL DEFAULT 'Pendiente',
DROP COLUMN "tipoRecurrencia",
ADD COLUMN     "tipoRecurrencia" "TipoRecurrencia" NOT NULL DEFAULT 'Unica';

-- AlterTable
ALTER TABLE "Salas" ALTER COLUMN "idDepartamento" DROP NOT NULL;

-- DropTable
DROP TABLE "PartcipantesAdicionales";

-- DropTable
DROP TABLE "departamentos";

-- DropTable
DROP TABLE "proyectos";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "usuarios";

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departamentos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "Departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "contraseña" VARCHAR(100) NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "id_departamento" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tecnicos" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "especialidad" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Tecnicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisponibilidadTecnicos" (
    "id" SERIAL NOT NULL,
    "idTecnico" INTEGER NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TIME NOT NULL,
    "horaFin" TIME NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DisponibilidadTecnicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TiposEquipo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "marca" VARCHAR(100),
    "modelo" VARCHAR(100),
    "año" INTEGER,

    CONSTRAINT "TiposEquipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquiposSala" (
    "id" SERIAL NOT NULL,
    "idSala" INTEGER NOT NULL,
    "idTipoEquipo" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoEquipo" NOT NULL DEFAULT 'Operativo',
    "numeroSerie" VARCHAR(100),
    "fechaAdquisicion" DATE,
    "ultimaRevision" DATE,
    "notas" TEXT,

    CONSTRAINT "EquiposSala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiciosAdicionales" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "costo" DECIMAL(10,2),

    CONSTRAINT "ServiciosAdicionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservacionEquiposSolicitados" (
    "idReservacion" INTEGER NOT NULL,
    "idTipoEquipo" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "notas" TEXT,

    CONSTRAINT "ReservacionEquiposSolicitados_pkey" PRIMARY KEY ("idReservacion","idTipoEquipo")
);

-- CreateTable
CREATE TABLE "ReservacionServiciosSolicitados" (
    "idReservacion" INTEGER NOT NULL,
    "idServicioAdicional" INTEGER NOT NULL,
    "cantidad" INTEGER DEFAULT 1,
    "notas" TEXT,

    CONSTRAINT "ReservacionServiciosSolicitados_pkey" PRIMARY KEY ("idReservacion","idServicioAdicional")
);

-- CreateTable
CREATE TABLE "ParticipantesAdicionales" (
    "id" SERIAL NOT NULL,
    "idReservacion" INTEGER NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "email" VARCHAR(100) NOT NULL,

    CONSTRAINT "ParticipantesAdicionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FechasBloqueadas" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "motivo" VARCHAR(255) NOT NULL,
    "idUsuarioCreador" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FechasBloqueadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialReservaciones" (
    "id" SERIAL NOT NULL,
    "idReservacion" INTEGER NOT NULL,
    "accionRealizada" VARCHAR(100) NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaAccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalles" TEXT,

    CONSTRAINT "HistorialReservaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_nombre_key" ON "Roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Departamentos_nombre_key" ON "Departamentos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tecnicos_idUsuario_key" ON "Tecnicos"("idUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "TiposEquipo_nombre_key" ON "TiposEquipo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ServiciosAdicionales_nombre_key" ON "ServiciosAdicionales"("nombre");

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "Departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tecnicos" ADD CONSTRAINT "Tecnicos_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisponibilidadTecnicos" ADD CONSTRAINT "DisponibilidadTecnicos_idTecnico_fkey" FOREIGN KEY ("idTecnico") REFERENCES "Tecnicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salas" ADD CONSTRAINT "Salas_idDepartamento_fkey" FOREIGN KEY ("idDepartamento") REFERENCES "Departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salas" ADD CONSTRAINT "Salas_idTecnicoResponsable_fkey" FOREIGN KEY ("idTecnicoResponsable") REFERENCES "Tecnicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquiposSala" ADD CONSTRAINT "EquiposSala_idSala_fkey" FOREIGN KEY ("idSala") REFERENCES "Salas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquiposSala" ADD CONSTRAINT "EquiposSala_idTipoEquipo_fkey" FOREIGN KEY ("idTipoEquipo") REFERENCES "TiposEquipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservaciones" ADD CONSTRAINT "Reservaciones_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservaciones" ADD CONSTRAINT "Reservaciones_idUsuarioUltimaModificacion_fkey" FOREIGN KEY ("idUsuarioUltimaModificacion") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservaciones" ADD CONSTRAINT "Reservaciones_idTecnicoAsignado_fkey" FOREIGN KEY ("idTecnicoAsignado") REFERENCES "Tecnicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservacionEquiposSolicitados" ADD CONSTRAINT "ReservacionEquiposSolicitados_idReservacion_fkey" FOREIGN KEY ("idReservacion") REFERENCES "Reservaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservacionEquiposSolicitados" ADD CONSTRAINT "ReservacionEquiposSolicitados_idTipoEquipo_fkey" FOREIGN KEY ("idTipoEquipo") REFERENCES "TiposEquipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservacionServiciosSolicitados" ADD CONSTRAINT "ReservacionServiciosSolicitados_idReservacion_fkey" FOREIGN KEY ("idReservacion") REFERENCES "Reservaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservacionServiciosSolicitados" ADD CONSTRAINT "ReservacionServiciosSolicitados_idServicioAdicional_fkey" FOREIGN KEY ("idServicioAdicional") REFERENCES "ServiciosAdicionales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantesAdicionales" ADD CONSTRAINT "ParticipantesAdicionales_idReservacion_fkey" FOREIGN KEY ("idReservacion") REFERENCES "Reservaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FechasBloqueadas" ADD CONSTRAINT "FechasBloqueadas_idUsuarioCreador_fkey" FOREIGN KEY ("idUsuarioCreador") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialReservaciones" ADD CONSTRAINT "HistorialReservaciones_idReservacion_fkey" FOREIGN KEY ("idReservacion") REFERENCES "Reservaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialReservaciones" ADD CONSTRAINT "HistorialReservaciones_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
