import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.js";
import { serverConfig } from "./config/server.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, "../public");
const app = await buildApp({ staticDir, logger: true });
await app.listen(serverConfig);
//# sourceMappingURL=server.js.map