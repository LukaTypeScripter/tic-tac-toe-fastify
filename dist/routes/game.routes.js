import { roomManager } from "../services/room-manager.js";
export async function gameRoutes(app) {
    app.get("/game", { websocket: true }, (socket) => {
        socket.on("message", (data) => {
            const message = JSON.parse(String(data));
            if (message.type === "create_room") {
                roomManager.createRoom(socket);
            }
            if (message.type === "join_room") {
                roomManager.joinRoom(message.roomId, socket);
            }
            if (message.type === "make_move") {
                roomManager.makeMove(message.roomId, socket, message.cellIndex);
            }
            if (message.type === "reset_game") {
                roomManager.resetGame(message.roomId);
            }
        });
        socket.on("close", () => {
            roomManager.leave(socket);
        });
    });
}
//# sourceMappingURL=game.routes.js.map