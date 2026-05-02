import { Type, type Static } from "@sinclair/typebox";

import type { WebSocketClient } from "./web-socket-client.type.js";

export const PlayerSchema = Type.Union([Type.Literal("X"), Type.Literal("O")]);

export const CellSchema = Type.Union([PlayerSchema,Type.Literal("EMPTY")]);

export const WinnerSchema = Type.Union([
  PlayerSchema,
  Type.Literal("draw"),
  Type.Null(),
]);

export const RoomPlayerSchema = Type.Object({
  nickname: Type.String({ minLength: 1, maxLength: 24 }),
  client: Type.Optional(Type.Unsafe<WebSocketClient>()),
});

export const RoomSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  board: Type.Array(CellSchema, { minItems: 9, maxItems: 9 }),
  turn: PlayerSchema,
  winner: WinnerSchema,
  players: Type.Object({
    X: Type.Optional(RoomPlayerSchema),
    O: Type.Optional(RoomPlayerSchema),
  }),
  spectators: Type.Unsafe<Set<WebSocketClient>>(),
});

export type Player = Static<typeof PlayerSchema>;
export type Cell = Static<typeof CellSchema>;
export type Room = Static<typeof RoomSchema>;
