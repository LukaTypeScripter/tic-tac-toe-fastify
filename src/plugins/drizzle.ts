import fp from "fastify-plugin";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema.js";




export type Db = NodePgDatabase<typeof schema>;

declare module "fastify" {
  interface FastifyInstance {
    db: Db;
  }
}

export default fp(async (fastify) => {
  const databaseUrl = process.env.DATABASE_URL;
  console.log(databaseUrl)

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to initialize Drizzle.");
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const db = drizzle<typeof schema>(pool, { schema });

  fastify.decorate("db", db);

  fastify.addHook("onClose", async () => {
    await pool.end();
  });
});
