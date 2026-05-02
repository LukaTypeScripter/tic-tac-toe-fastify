import fp from "fastify-plugin";

import { createRepositories, type Repositories } from "../repositories/index.js";

declare module "fastify" {
  interface FastifyInstance {
    repositories: Repositories;
  }
}

export default fp(async (fastify) => {
  fastify.decorate("repositories", createRepositories(fastify.db));
});
