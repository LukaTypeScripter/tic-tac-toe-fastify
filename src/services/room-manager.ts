import type { Cell, Player, Room } from "../types/room.type.js";
import type { ServerMessage } from "../types/server-message.type.js";
import type { WebSocketClient } from "../types/web-socket-client.type.js";

const OPEN = 1;

type Seat = Player | "spectator";

export class RoomManager {
  private readonly rooms = new Map<string, Room>();

  createRoom(client: WebSocketClient, nickName: string) {
    const roomId = this.createRoomId();
    const room: Room = {
      id: roomId,
      board: this.createBoard(),
      turn: "X",
      winner: null,
      players: {
        X: {
          client: client,
          nickname: nickName,
        },
      },
      spectators: new Set(),
    };

    this.rooms.set(roomId, room);
    this.send(client, {
      type: "room_joined",
      roomId,
      player: "X",
      nickname: nickName,
    });
    this.broadcastRoomState(room);
  }

  joinRoom(roomId: string, client: WebSocketClient, nickName: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      this.send(client, { type: "error", message: "Room not found." });
      return;
    }

    const player = this.assignSeat(room, client, nickName);
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
      if (room.players.X?.client === client) {
        delete room.players.X;
      }

      if (room.players.O?.client === client) {
        delete room.players.O;
      }

      room.spectators.delete(client);

      if (!room.players.X && !room.players.O && room.spectators.size === 0) {
        this.rooms.delete(roomId);
        return;
      }

      this.broadcastRoomState(room);
    }
  }

  makeMove(roomId: string, client: WebSocketClient, cellIndex: number) {
    const room = this.rooms.get(roomId);

    if (!room) {
      this.send(client, { type: "error", message: "Room not found." });
      return;
    }

    if (room.winner) {
      this.send(client, { type: "error", message: "Game is already over." });
      return;
    }

    if (cellIndex < 0 || cellIndex > 8 || room.board[cellIndex]) {
      this.send(client, { type: "error", message: "Invalid move." });
      return;
    }

    if (room.players[room.turn]?.client !== client) {
      this.send(client, { type: "error", message: "It is not your turn." });
      return;
    }

    room.board[cellIndex] = room.turn;
    room.winner = this.checkWinner(room.board);

    if (!room.winner) {
      room.turn = room.turn === "X" ? "O" : "X";
    }

    this.broadcastRoomState(room);
  }

  resetGame(roomId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    room.board = this.createBoard();
    room.turn = "X";
    room.winner = null;
    this.broadcastRoomState(room);
  }

  checkWinner(board: Cell[]): Player | "draw" | null {
    const lines: Array<[number, number, number]> = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return board.every(Boolean) ? "draw" : null;
  }

  private assignSeat(
    room: Room,
    client: WebSocketClient,
    nickName: string,
  ): Seat {
    if (!room.players.X) {
      room.players.X = {
        nickname: nickName,
        client,
      };
      return "X";
    }

    if (!room.players.O) {
      room.players.O = {
        nickname: nickName,
        client,
      };
      return "O";
    }

    room.spectators.add(client);
    return "spectator";
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

    for (const client of this.getRoomClients(room)) {
      this.send(client, message);
    }
  }

  private getRoomClients(room: Room) {
    const clients: WebSocketClient[] = [];

    if (room.players.X?.client.readyState === OPEN) {
      clients.push(room.players.X.client);
    }

    if (room.players.O?.client.readyState === OPEN) {
      clients.push(room.players.O.client);
    }

    for (const spectator of room.spectators) {
      if (spectator.readyState === OPEN) {
        clients.push(spectator);
      }
    }

    return clients;
  }

  private send(client: WebSocketClient, message: ServerMessage) {
    if (client.readyState === OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private createBoard(): Cell[] {
    return Array<Cell>(9).fill(null);
  }

  private createRoomId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }
}

export const roomManager = new RoomManager();
