export async function registerHealthRoutes(app) {
    app.get("/ping", async () => {
        return "pong\n";
    });
}
//# sourceMappingURL=health.routes.js.map