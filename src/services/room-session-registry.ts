import type { Player, Room } from "../types/room.type.js";
import type { WebSocketClient } from "../types/web-socket-client.type.js";

const OPEN = 1;

type Seat = Player | "spectator";

export class RoomSessionRegistry {
  assignSeat(room: Room, client: WebSocketClient, nickName: string): Seat {
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

  removeClient(room: Room, client: WebSocketClient) {
    if (room.players.X?.client === client) {
      delete room.players.X;
    }

    if (room.players.O?.client === client) {
      delete room.players.O;
    }

    room.spectators.delete(client);
  }

  isRoomEmpty(room: Room) {
    return !room.players.X && !room.players.O && room.spectators.size === 0;
  }

  isCurrentTurnClient(room: Room, client: WebSocketClient) {
    return room.players[room.turn]?.client === client;
  }

  getConnectedClients(room: Room) {
    const clients: WebSocketClient[] = [];

    if (room.players.X?.client?.readyState === OPEN) {
      clients.push(room.players.X.client);
    }

    if (room.players.O?.client?.readyState === OPEN) {
      clients.push(room.players.O.client);
    }

    for (const spectator of room.spectators) {
      if (spectator.readyState === OPEN) {
        clients.push(spectator);
      }
    }

    return clients;
  }
}
