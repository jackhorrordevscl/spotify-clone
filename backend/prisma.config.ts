// backend/prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Usamos process.env en lugar de env() de Prisma
// env() lanza PrismaConfigEnvError si la variable no existe (falla en build)
// process.env devuelve undefined sin lanzar error
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...(process.env.DATABASE_URL && {
    datasource: {
      url: process.env.DATABASE_URL,
    },
  }),
});
