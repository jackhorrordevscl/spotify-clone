# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependencias primero (mejor cache)
COPY package*.json ./
RUN npm ci

# Copiar código fuente y archivos Prisma
COPY . .

# Generar cliente Prisma
RUN npx prisma generate --config prisma.config.ts

# Compilar TypeScript
RUN npm run build

# ============================================================
# Stage 2: Runner (imagen final ligera)
# ============================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar build y archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001

# Ejecutar migraciones y luego iniciar servidor
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma.config.ts && node dist/src/index.js"]