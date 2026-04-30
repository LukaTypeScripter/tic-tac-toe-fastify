const OPEN = 1;
export class ChatRoom {
    clients = new Set();
    join(client) {
        this.clients.add(client);
        client.send(this.serialize({ type: "system", text: "Connected to chat" }));
    }
    leave(client) {
        this.clients.delete(client);
    }
    send(text) {
        if (!text) {
            return;
        }
        this.broadcast({ type: "message", text });
    }
    broadcast(event) {
        const message = this.serialize(event);
        for (const client of this.clients) {
            if (client.readyState === OPEN) {
                client.send(message);
            }
        }
    }
    serialize(event) {
        return JSON.stringify(event);
    }
}
export const chatRoom = new ChatRoom();
//# sourceMappingURL=chat-room.js.map