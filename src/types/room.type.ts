import type { WebSocketClient } from "./web-socket-client.type.js";

export type Room = {
  id: string;
  board: Array<"X" | "O" | null>;
  turn: "X" | "O";
  winner: "X" | "O" | "draw" | null;
  players: {
    X?: WebSocketClient;
    O?: WebSocketClient;
  };
  spectators: Set<WebSocketClient>;
};
