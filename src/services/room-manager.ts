import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";

import type { Player, Room } from "../types/room.type.js";
import type { ServerMessage } from "../types/server-message.type.js";
import type { WebSocketClient } from "../types/web-socket-client.type.js";
import { RoomManagerError } from "./room-manager-error.js";
import { GameEngine } from "./game-engine.js";
import { RoomSessionRegistry } from "./room-session-registry.js";
import { RoomStore } from "./room-store.js";

const OPEN = 1;

export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  private readonly gameEngine = new GameEngine();
  private readonly sessionRegistry = new RoomSessionRegistry();
  private readonly roomStore: RoomStore | undefined;

  constructor(app?: FastifyInstance) {
    this.roomStore = app ? new RoomStore(app.repositories) : undefined;
  }

  async createRoom(client: WebSocketClient, nickName: string) {
    const roomId = this.gameEngine.createRoomId();
    const playerId = randomUUID();
    let room: Room = {
      id: roomId,
      board: this.gameEngine.createBoard(),
      turn: "X",
      winner: null,
      players: {
        X: {
          nickname: nickName,
          client,
        },
      },
      spectators: new Set(),
    };

    if (this.roomStore) {
      const createdRoom = await this.roomStore.createRoomWithFirstPlayer({
        roomId,
        playerId,
        nickName,
        board: this.gameEngine.createDbBoard(),
        turn: "X",
      });

      if (!createdRoom) {
        this.sendError(client, RoomManagerError.roomCantBeCreated());
        return;
      }

      const hydratedRoom = await this.buildRoom(roomId);

      if (!hydratedRoom) {
        this.sendError(client, RoomManagerError.roomCantBeCreated());
        return;
      }

      room = hydratedRoom;
      room.players.X = {
        nickname: nickName,
        client,
      };
    }

    this.rooms.set(roomId, room);

    this.send(client, {
      type: "room_joined",
      roomId,
      player: "X",
      nickname: nickName,
    });

    this.broadcastRoomState(room);
  }

  async joinRoom(roomId: string, client: WebSocketClient, nickName: string) {
    const room = await this.getRoom(roomId);

    if (!room) {
      this.sendError(client, RoomManagerError.roomNotFound());
      return;
    }

    const player = this.sessionRegistry.assignSeat(room, client, nickName);

    this.send(client, {
      type: "room_joined",
      roomId,
      player,
      nickname: nickName,
    });

    this.broadcastRoomState(room);
  }

  leave(client: WebSocketClient) {
    for (const [roomId, room] of this.rooms.entries()) {
      this.sessionRegistry.removeClient(room, client);

      if (this.sessionRegistry.isRoomEmpty(room)) {
        this.rooms.delete(roomId);
        return;
      }

      this.broadcastRoomState(room);
    }
  }

  async makeMove(roomId: string, client: WebSocketClient, cellIndex: number) {
    const room = await this.getRoomForMove(roomId);

    if (!room) {
      this.sendError(client, RoomManagerError.roomNotFound());
      return;
    }

    if (room.winner) {
      this.sendError(client, RoomManagerError.gameAlreadyOver());
      return;
    }

    if (cellIndex < 0 || cellIndex > 8 || room.board[cellIndex] !== "EMPTY") {
      this.sendError(client, RoomManagerError.invalidMove());
      return;
    }

    if (!this.sessionRegistry.isCurrentTurnClient(room, client)) {
      this.sendError(client, RoomManagerError.notPlayerTurn());
      return;
    }

    room.board[cellIndex] = room.turn;
    room.winner = this.gameEngine.checkWinner(room.board);

    if (!room.winner) {
      room.turn = room.turn === "X" ? "O" : "X";
    }

    await this.persistRoomState(room);
    this.broadcastRoomState(room);
  }

  async resetGame(roomId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    room.board = this.gameEngine.createBoard();
    room.turn = "X";
    room.winner = null;

    await this.roomStore?.resetRoom(roomId);
    this.broadcastRoomState(room);
  }

  private broadcastRoomState(room: Room) {
    const players: { X?: string; O?: string } = {};

    if (room.players.X) {
      players.X = room.players.X.nickname;
    }

    if (room.players.O) {
      players.O = room.players.O.nickname;
    }

    const message: ServerMessage = {
      type: "game_state",
      roomId: room.id,
      board: room.board,
      turn: room.turn,
      players,
      winner: room.winner,
    };

    for (const client of this.sessionRegistry.getConnectedClients(room)) {
      this.send(client, message);
    }
  }

  private send(client: WebSocketClient, message: ServerMessage) {
    if (client.readyState === OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private sendError(client: WebSocketClient, error: RoomManagerError) {
    this.send(client, {
      type: "error",
      code: error.code,
      message: error.message,
    });
  }


  private async getRoom(roomId: string) {
    return this.rooms.get(roomId) ?? await this.buildRoom(roomId);
  }

  private async getRoomForMove(roomId: string) {
    const room = await this.getRoom(roomId);

    if (!room) {
      return null;
    }

    if (!this.roomStore) {
      return room;
    }

    const roomRow = await this.roomStore.findRoomRow(roomId);

    if (!roomRow) {
      return null;
    }

    room.board = roomRow.board as Room["board"];
    room.turn = roomRow.turn;
    room.winner = this.gameEngine.checkWinner(roomRow.board as Room["board"]);
    return room;
  }

  private async persistRoomState(room: Room) {
    if (!this.roomStore) {
      return;
    }

    await this.roomStore.saveGameState(room.id, {
      board: room.board,
      turn: room.turn,
      winnerId: null,
    });
  }

  private async buildRoom(roomId: string) {
    if (!this.roomStore) {
      return null;
    }

    const room = await this.roomStore.loadRoom(roomId);

    if (!room) {
      return null;
    }

    room.winner = this.gameEngine.checkWinner(room.board);
    this.rooms.set(roomId, room);
    return room;
  }
}
