import type { Repositories } from "../repositories/index.js";
import type { NewRoom } from "../repositories/room.repository.js";
import type { Cell, Player, Room } from "../types/room.type.js";

export type CreateRoomWithHostInput = {
  roomId: string;
  playerId: string;
  nickName: string;
  board: NewRoom["board"];
  turn: Player;
};

export class RoomStore {
  constructor(private readonly repositories: Repositories) {}

  createRoomWithFirstPlayer(input: CreateRoomWithHostInput) {
    return this.repositories.transaction(async (repositories) => {
      const player = await repositories.player.create({
        id: input.playerId,
        nickName: input.nickName,
      });

      const room = await repositories.room.create({
        id: input.roomId,
        board: input.board,
        turn: input.turn,
        winnerId: null,
      });

      await repositories.roomPlayer.add({
        roomId: input.roomId,
        playerId: input.playerId,
        mark: "X",
      });

      return { player, room };
    });
  }

  async findRoomRow(roomId: string) {
    return this.repositories.room.findById(roomId);
  }

  async loadRoom(roomId: string): Promise<Room | null> {
    const roomRow = await this.repositories.room.findById(roomId);

    if (!roomRow) {
      return null;
    }

    const roomPlayers = await this.repositories.roomPlayer.findByRoomId(roomId);
    const players: Room["players"] = {};
    const roomPlayersIds = roomPlayers.map((d) => d.playerId);
    const playersList = await this.repositories.player.findByIds(roomPlayersIds);

    for (const roomPlayer of roomPlayers) {
      const player = playersList.find((p) => roomPlayer.playerId === p.id);

      if (!player) {
        continue;
      }

      players[roomPlayer.mark] = {
        nickname: player.nickName,
      };
    }

    return {
      id: roomRow.id,
      board: roomRow.board as Cell[],
      turn: roomRow.turn,
      winner: null,
      players,
      spectators: new Set(),
    };
  }

  saveGameState(
    roomId: string,
    patch: Pick<NewRoom, "board" | "turn"> & { winnerId: string | null },
  ) {
    return this.repositories.room.update(roomId, patch);
  }

  resetRoom(roomId: string) {
    return this.repositories.room.reset(roomId);
  }
}
