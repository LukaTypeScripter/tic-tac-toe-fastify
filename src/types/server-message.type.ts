import { Type, type Static } from "@sinclair/typebox";

import { CellSchema, PlayerSchema, WinnerSchema } from "./room.type.js";

export const PlayerSeatSchema = Type.Union([
  Type.Literal("X"),
  Type.Literal("O"),
  Type.Literal("spectator"),
]);

export const RoomJoinedMessageSchema = Type.Object({
  type: Type.Literal("room_joined"),
  roomId: Type.String(),
  player: PlayerSeatSchema,
  nickname: Type.String(),
});

export const GameStateMessageSchema = Type.Object({
  type: Type.Literal("game_state"),
  roomId: Type.String(),
  board: Type.Array(CellSchema, { minItems: 9, maxItems: 9 }),
  turn: PlayerSchema,
  players: Type.Object({
    X: Type.Optional(Type.String()),
    O: Type.Optional(Type.String()),
  }),
  winner: WinnerSchema,
});

export const ServerErrorSchema = Type.Object({
  type: Type.Literal("error"),
  code: Type.Optional(Type.String()),
  message: Type.String(),
});

export const ServerMessageSchema = Type.Union([
  RoomJoinedMessageSchema,
  GameStateMessageSchema,
  ServerErrorSchema,
]);

export type ServerMessage = Static<typeof ServerMessageSchema>;

export const CreateRoomMessageSchema = Type.Object({
  type: Type.Literal("create_room"),
  nickname: Type.String(),
});

export const JoinRoomMessageSchema = Type.Object({
  type: Type.Literal("join_room"),
  roomId: Type.String(),
  nickname: Type.String(),
});

export const MakeMoveMessageSchema = Type.Object({
  type: Type.Literal("make_move"),
  roomId: Type.String(),
  cellIndex: Type.Integer({ minimum: 0, maximum: 8 }),
});

export const ResetGameMessageSchema = Type.Object({
  type: Type.Literal("reset_game"),
  roomId: Type.String(),
});

export const ClientMessageSchema = Type.Union([
  CreateRoomMessageSchema,
  JoinRoomMessageSchema,
  MakeMoveMessageSchema,
  ResetGameMessageSchema,
]);

export type ClientMessage = Static<typeof ClientMessageSchema>;
