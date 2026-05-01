import type { FastifyInstance } from "fastify";
import { roomManager } from "../services/room-manager.js";
import type { ClientMessage } from "../types/server-message.type.js";

export async function gameRoutes(app: FastifyInstance) {
  app.get("/game", { websocket: true }, (socket) => {
    socket.on("message", (data: unknown) => {
      const message: ClientMessage = JSON.parse(String(data));

      if (message.type === "create_room") {
        roomManager.createRoom(socket, message.nickname);
      }

      if (message.type === "join_room") {
        roomManager.joinRoom(message.roomId, socket, message.nickname);
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
