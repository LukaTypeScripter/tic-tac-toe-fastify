const OPEN = 1;
export class RoomManager {
    rooms = new Map();
    createRoom(client) {
        const roomId = this.createRoomId();
        const room = {
            id: roomId,
            board: this.createBoard(),
            turn: "X",
            winner: null,
            players: {
                X: client,
            },
            spectators: new Set(),
        };
        this.rooms.set(roomId, room);
        this.send(client, { type: "room_joined", roomId, player: "X" });
        this.broadcastRoomState(room);
    }
    joinRoom(roomId, client) {
        const room = this.rooms.get(roomId);
        if (!room) {
            this.send(client, { type: "error", message: "Room not found." });
            return;
        }
        const player = this.assignSeat(room, client);
        this.send(client, { type: "room_joined", roomId, player });
        this.broadcastRoomState(room);
    }
    leave(client) {
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.players.X === client) {
                delete room.players.X;
            }
            if (room.players.O === client) {
                delete room.players.O;
            }
            room.spectators.delete(client);
            if (!room.players.X && !room.players.O && room.spectators.size === 0) {
                this.rooms.delete(roomId);
                return;
            }
            this.broadcastRoomState(room);
        }
    }
    makeMove(roomId, client, cellIndex) {
        const room = this.rooms.get(roomId);
        if (!room) {
            this.send(client, { type: "error", message: "Room not found." });
            return;
        }
        if (room.winner) {
            this.send(client, { type: "error", message: "Game is already over." });
            return;
        }
        if (cellIndex < 0 || cellIndex > 8 || room.board[cellIndex]) {
            this.send(client, { type: "error", message: "Invalid move." });
            return;
        }
        if (room.players[room.turn] !== client) {
            this.send(client, { type: "error", message: "It is not your turn." });
            return;
        }
        room.board[cellIndex] = room.turn;
        room.winner = this.checkWinner(room.board);
        if (!room.winner) {
            room.turn = room.turn === "X" ? "O" : "X";
        }
        this.broadcastRoomState(room);
    }
    resetGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        room.board = this.createBoard();
        room.turn = "X";
        room.winner = null;
        this.broadcastRoomState(room);
    }
    checkWinner(board) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (const [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return board.every(Boolean) ? "draw" : null;
    }
    assignSeat(room, client) {
        if (!room.players.X) {
            room.players.X = client;
            return "X";
        }
        if (!room.players.O) {
            room.players.O = client;
            return "O";
        }
        room.spectators.add(client);
        return "spectator";
    }
    broadcastRoomState(room) {
        const message = {
            type: "game_state",
            roomId: room.id,
            board: room.board,
            turn: room.turn,
            winner: room.winner,
        };
        for (const client of this.getRoomClients(room)) {
            this.send(client, message);
        }
    }
    getRoomClients(room) {
        const clients = [];
        if (room.players.X?.readyState === OPEN) {
            clients.push(room.players.X);
        }
        if (room.players.O?.readyState === OPEN) {
            clients.push(room.players.O);
        }
        for (const spectator of room.spectators) {
            if (spectator.readyState === OPEN) {
                clients.push(spectator);
            }
        }
        return clients;
    }
    send(client, message) {
        if (client.readyState === OPEN) {
            client.send(JSON.stringify(message));
        }
    }
    createBoard() {
        return Array(9).fill(null);
    }
    createRoomId() {
        return Math.random().toString(36).slice(2, 8).toUpperCase();
    }
}
export const roomManager = new RoomManager();
//# sourceMappingURL=room-manager.js.map