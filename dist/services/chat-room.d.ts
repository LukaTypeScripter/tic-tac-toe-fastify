type ChatClient = {
    readyState: number;
    send(message: string): void;
};
export declare class ChatRoom {
    private readonly clients;
    join(client: ChatClient): void;
    leave(client: ChatClient): void;
    send(text: string): void;
    private broadcast;
    private serialize;
}
export declare const chatRoom: ChatRoom;
export {};
//# sourceMappingURL=chat-room.d.ts.map