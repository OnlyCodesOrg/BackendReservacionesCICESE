# Usar una imagen base oficial de Node.js
FROM node:18-alpine AS base

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Generar cliente de Prisma
RUN npx prisma generate

# Fase de desarrollo
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Fase de build
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Fase de producción
FROM node:18-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copiar node_modules desde la fase base
COPY --from=base --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=nestjs:nodejs /app/package*.json ./

# Copiar el código compilado desde la fase build
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=base --chown=nestjs:nodejs /app/generated ./generated

USER nestjs

EXPOSE 3000

# Comando de producción
CMD ["node", "dist/main"] 