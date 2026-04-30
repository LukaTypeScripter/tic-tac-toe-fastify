import { chatRoom } from "../services/chat-room.js";
export async function registerChatRoutes(app) {
    app.get("/chat", { websocket: true }, (socket) => {
        chatRoom.join(socket);
        socket.on("message", (data) => {
            chatRoom.send(String(data).trim());
        });
        socket.on("close", () => {
            chatRoom.leave(socket);
        });
    });
}
//# sourceMappingURL=chat.routes.js.map