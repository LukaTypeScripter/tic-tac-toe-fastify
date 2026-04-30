import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import fastify, { type FastifyInstance } from "fastify";

import { registerHealthRoutes } from "./routes/health.routes.js";
import { gameRoutes } from "./routes/game.routes.js";

export type AppOptions = {
  staticDir: string;
  logger?: boolean;
};

export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const app = fastify({
    logger: options.logger ?? true,
  });

  await app.register(fastifyWebsocket);

  await app.register(fastifyStatic, {
    root: options.staticDir,
  });

  await app.register(registerHealthRoutes);
  await app.register(gameRoutes);

  return app;
}
