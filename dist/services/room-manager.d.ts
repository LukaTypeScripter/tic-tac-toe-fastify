import type { Cell, Player } from "../types/server-message.type.js";
import type { WebSocketClient } from "../types/web-socket-client.type.js";
export declare class RoomManager {
    private readonly rooms;
    createRoom(client: WebSocketClient): void;
    joinRoom(roomId: string, client: WebSocketClient): void;
    leave(client: WebSocketClient): void;
    makeMove(roomId: string, client: WebSocketClient, cellIndex: number): void;
    resetGame(roomId: string): void;
    checkWinner(board: Cell[]): Player | "draw" | null;
    private assignSeat;
    private broadcastRoomState;
    private getRoomClients;
    private send;
    private createBoard;
    private createRoomId;
}
export declare const roomManager: RoomManager;
//# sourceMappingURL=room-manager.d.ts.map