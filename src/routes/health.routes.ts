import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/ping", async () => {
    return "pong\n";
  });
}
