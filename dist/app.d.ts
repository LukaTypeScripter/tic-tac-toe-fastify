import { type FastifyInstance } from "fastify";
export type AppOptions = {
    staticDir: string;
    logger?: boolean;
};
export declare function buildApp(options: AppOptions): Promise<FastifyInstance>;
//# sourceMappingURL=app.d.ts.map