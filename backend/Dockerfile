# backend/Dockerfile

# ── Etapa 1: dependencias ──────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Sin postinstall, npm ci solo instala dependencias
RUN npm ci

# ── Etapa 2: build ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar TODO el código fuente (incluye prisma/schema.prisma)
COPY . .

# Ahora sí existe prisma/schema.prisma → generate funciona
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# ── Etapa 3: runner ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar artefactos del build
COPY --from=builder /app/dist      ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma    ./prisma
COPY prisma.config.ts              ./prisma.config.ts

EXPOSE 3001
CMD ["sh", "start.sh"]