import path from "node:path";

import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";

const staticDir = path.resolve(process.cwd(), "public");
const apps: FastifyInstance[] = [];

async function createTestApp() {
  const app = await buildApp({ staticDir, logger: false, database: false });
  apps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("app", () => {
  it("serves the health route", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/ping",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("pong\n");
  });

  it("serves the browser client", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.body).toContain("Tic Tac Toe");
  });
});
