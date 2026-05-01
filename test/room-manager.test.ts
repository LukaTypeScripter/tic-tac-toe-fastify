import { describe, expect, it, vi } from "vitest";

import { RoomManager } from "../src/services/room-manager.js";

const open = 1;

function createClient() {
  return {
    readyState: open,
    send: vi.fn(),
  };
}

function sentMessages(client: ReturnType<typeof createClient>) {
  return client.send.mock.calls.map(([message]) => JSON.parse(message));
}

describe("RoomManager", () => {
  it("creates a room and assigns the creator as X", () => {
    const manager = new RoomManager();
    const client = createClient();

    manager.createRoom(client, "Luka");

    const messages = sentMessages(client);

    expect(messages[0]).toMatchObject({
      type: "room_joined",
      player: "X",
    });
    expect(messages[1]).toMatchObject({
      type: "game_state",
      board: Array(9).fill(null),
      turn: "X",
      players: {
        X: "Luka",
      },
      winner: null,
    });
  });

  it("detects a winning line", () => {
    const manager = new RoomManager();

    expect(manager.checkWinner(["X", "X", "X", null, null, null, null, null, null])).toBe(
      "X",
    );
  });

  it("detects a draw", () => {
    const manager = new RoomManager();

    expect(manager.checkWinner(["X", "O", "X", "X", "O", "O", "O", "X", "X"])).toBe(
      "draw",
    );
  });
});
