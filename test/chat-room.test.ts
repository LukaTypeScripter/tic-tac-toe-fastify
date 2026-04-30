import { describe, expect, it, vi } from "vitest";

import { ChatRoom } from "../src/services/chat-room.js";

const open = 1;
const closed = 3;

function createClient(readyState = open) {
  return {
    readyState,
    send: vi.fn(),
  };
}

describe("ChatRoom", () => {
  it("sends a system message when a client joins", () => {
    const room = new ChatRoom();
    const client = createClient();

    room.join(client);

    expect(client.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "system", text: "Connected to chat" }),
    );
  });

  it("broadcasts messages to connected clients only", () => {
    const room = new ChatRoom();
    const connected = createClient();
    const disconnected = createClient(closed);

    room.join(connected);
    room.join(disconnected);

    connected.send.mockClear();
    disconnected.send.mockClear();

    room.send("hello");

    expect(connected.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "message", text: "hello" }),
    );
    expect(disconnected.send).not.toHaveBeenCalled();
  });

  it("ignores blank messages", () => {
    const room = new ChatRoom();
    const client = createClient();

    room.join(client);
    client.send.mockClear();

    room.send("");

    expect(client.send).not.toHaveBeenCalled();
  });
});
