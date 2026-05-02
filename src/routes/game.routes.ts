import type { FastifyInstance } from "fastify";
import {RoomManager} from "../services/room-manager.js";
import type { ClientMessage } from "../types/server-message.type.js";

export async function gameRoutes(app: FastifyInstance) {
  app.get("/game", { websocket: true }, (socket) => {
    const manger = new RoomManager(app)
    socket.on("message", async (data: unknown) => {


      const message: ClientMessage = JSON.parse(String(data));

      if (message.type === "create_room") {
         await manger.createRoom(socket, message.nickname);
      }

      if (message.type === "join_room") {
        await manger.joinRoom(message.roomId, socket, message.nickname);
      }

      if (message.type === "make_move") {
        manger.makeMove(message.roomId, socket, message.cellIndex);
      }

      if (message.type === "reset_game") {
        manger.resetGame(message.roomId);
      }
    });

    socket.on("close", () => {
      manger.leave(socket);
    });
  });
}
