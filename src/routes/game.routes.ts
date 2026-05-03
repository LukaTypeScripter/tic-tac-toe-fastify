import type { FastifyInstance } from "fastify";
import {RoomManager} from "../services/room-manager.js";
import type { ClientMessage } from "../types/server-message.type.js";

export async function gameRoutes(app: FastifyInstance) {
  const manager = new RoomManager(app);

  app.get("/game", { websocket: true }, (socket) => {
    socket.on("message", async (data: unknown) => {


      const message: ClientMessage = JSON.parse(String(data));

      if (message.type === "create_room") {
         await manager.createRoom(socket, message.nickname);
      }

      if (message.type === "join_room") {
        await manager.joinRoom(message.roomId, socket, message.nickname);
      }

      if (message.type === "make_move") {
        await manager.makeMove(message.roomId, socket, message.cellIndex);
      }

      if (message.type === "reset_game") {
        await manager.resetGame(message.roomId);
      }

      if (message.type === "leave_room") {
        manager.leave(socket);
      }
    });

    socket.on("close", () => {
      manager.leave(socket);
    });
  });
}
