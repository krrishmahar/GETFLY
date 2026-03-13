import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "Warning: DATABASE_URL is not set. Prisma client will not connect to a database."
  );
}

export const prisma: PrismaClient | null = connectionString
  ? new PrismaClient({ adapter: new PrismaPg(new pg.Pool({ connectionString })) })
  : null;
