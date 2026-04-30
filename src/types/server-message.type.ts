export type Player = "X" | "O";
export type Cell = Player | null;

export type ServerMessage =
  | {
      type: "room_joined";
      roomId: string;
      player: "X" | "O" | "spectator";
    }
  | {
      type: "game_state";
      roomId: string;
      board: Cell[];
      turn: Player;
      winner: Player | "draw" | null;
    }
  | {
      type: "error";
      message: string;
    };

export type ClientMessage =
  | { type: "create_room" }
  | { type: "join_room"; roomId: string }
  | { type: "make_move"; roomId: string; cellIndex: number }
  | { type: "reset_game"; roomId: string };
