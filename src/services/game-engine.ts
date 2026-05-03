import type { Cell, Player } from "../types/room.type.js";



export class GameEngine {
    createBoard(): Cell[] {
        return Array<Cell>(9).fill("EMPTY");
      }
    
      createDbBoard() {
        return Array<"EMPTY">(9).fill("EMPTY");
      }
    
      createRoomId() {
        return Math.random().toString(36).slice(2, 8).toUpperCase();
      }

      checkWinner(board: Cell[]): Player | "draw" | null {
        const lines: Array<[number, number, number]> = [
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
          const first = board[a];
    
          if (first && first !== "EMPTY" && first === board[b] && first === board[c]) {
            return first;
          }
        }
    
        return board.every((cell) => cell !== "EMPTY") ? "draw" : null;
      }
}