-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "id_departamento" INTEGER NOT NULL,
    "Activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "especialidad" TEXT,
    "Activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservaciones" (
    "id" SERIAL NOT NULL,
    "numeroReservacion" VARCHAR(20) NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idTecnicoAsignado" INTEGER,
    "idSala" INTEGER NOT NULL,
    "nombreEvento" VARCHAR(100) NOT NULL,
    "tipoEvento" TEXT NOT NULL,
    "fechaEvento" DATE NOT NULL,
    "horaInicio" TIME NOT NULL,
    "horaFin" TIME NOT NULL,
    "numeroAsistentesEstimado" INTEGER NOT NULL,
    "numeroAsistentesReal" INTEGER,
    "estadoSolicitud" TEXT NOT NULL DEFAULT 'Pendiente',
    "tipoRecurrencia" TEXT NOT NULL DEFAULT 'Unica',
    "fechaFinRecurrencia" DATE,
    "observaciones" TEXT,
    "fechaCreacionSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUltimaModificacion" TIMESTAMP(3),
    "idUsuarioUltimaModificacion" INTEGER,
    "linkReunionOnline" VARCHAR(255),
    "fallasRegistradas" TEXT,

    CONSTRAINT "Reservaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartcipantesAdicionales" (
    "id" SERIAL NOT NULL,
    "idReservacion" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,

    CONSTRAINT "PartcipantesAdicionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salas" (
    "id" SERIAL NOT NULL,
    "idDepartamento" INTEGER NOT NULL,
    "idTecnicoResponsable" INTEGER NOT NULL,
    "nombreSala" VARCHAR(100) NOT NULL,
    "ubicacion" VARCHAR(255),
    "capacidadMin" INTEGER,
    "capacidadMax" INTEGER NOT NULL,
    "urlImagen" VARCHAR(255),
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,

    CONSTRAINT "Salas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombres_key" ON "roles"("nombres");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nombre_key" ON "departamentos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "proyectos_idUsuario_key" ON "proyectos"("idUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Reservaciones_numeroReservacion_key" ON "Reservaciones"("numeroReservacion");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservaciones" ADD CONSTRAINT "Reservaciones_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservaciones" ADD CONSTRAINT "Reservaciones_idTecnicoAsignado_fkey" FOREIGN KEY ("idTecnicoAsignado") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservaciones" ADD CONSTRAINT "Reservaciones_idSala_fkey" FOREIGN KEY ("idSala") REFERENCES "Salas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartcipantesAdicionales" ADD CONSTRAINT "PartcipantesAdicionales_idReservacion_fkey" FOREIGN KEY ("idReservacion") REFERENCES "Reservaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salas" ADD CONSTRAINT "Salas_idDepartamento_fkey" FOREIGN KEY ("idDepartamento") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salas" ADD CONSTRAINT "Salas_idTecnicoResponsable_fkey" FOREIGN KEY ("idTecnicoResponsable") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
