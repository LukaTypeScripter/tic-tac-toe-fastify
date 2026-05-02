export const roomManagerErrorMessages = {
  roomNotFound: "Room not found.",
  gameAlreadyOver: "Game is already over.",
  invalidMove: "Invalid move.",
  notPlayerTurn: "It is not your turn.",
  roomCantBeCreated: "Room can't be created.",
} as const;

export type RoomManagerErrorCode = keyof typeof roomManagerErrorMessages;

export class RoomManagerError extends Error {
  constructor(
    readonly code: RoomManagerErrorCode,
    message = roomManagerErrorMessages[code],
  ) {
    super(message);
    this.name = "RoomManagerError";
  }

  static roomNotFound() {
    return new RoomManagerError("roomNotFound");
  }

  static gameAlreadyOver() {
    return new RoomManagerError("gameAlreadyOver");
  }

  static invalidMove() {
    return new RoomManagerError("invalidMove");
  }

  static notPlayerTurn() {
    return new RoomManagerError("notPlayerTurn");
  }

  static roomCantBeCreated() {
    return new RoomManagerError("roomCantBeCreated");
  }
}
