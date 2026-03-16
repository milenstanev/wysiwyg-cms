import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const url = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url });
export const prisma = new PrismaClient({ adapter });
