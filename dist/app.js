import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import fastify, {} from "fastify";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { gameRoutes } from "./routes/game.routes.js";
export async function buildApp(options) {
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
//# sourceMappingURL=app.js.map