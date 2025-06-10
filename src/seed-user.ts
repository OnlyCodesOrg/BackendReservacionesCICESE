import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  // Crear el usuario
  const usuario = await prisma.usuarios.create({
    data: {
      nombre: 'Antonio',
      apellidos: 'Ramos',
      email: 'anrago@cicese.mx',
      contraseña: await hashPassword('123456'),
      id_rol: 2,
      id_departamento: 1,
    },
  });

  console.log('Usuario creado exitosamente:', usuario);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
