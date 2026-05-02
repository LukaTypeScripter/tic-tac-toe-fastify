import type { Db } from "../plugins/drizzle.js";
import { PlayerRepository } from "./player.repository.js";
import { RoomPlayerRepository } from "./room-player.repository.js";
import { RoomSpectatorRepository } from "./room-spectator.repository.js";
import { RoomRepository } from "./room.repository.js";
import { SessionRepository } from "./session.repository.js";
import type { RepositoryDb, Transaction } from "./types.js";

export type RepositorySet = ReturnType<typeof createRepositorySet>;
export type Repositories = ReturnType<typeof createRepositories>;

export function createRepositorySet(db: RepositoryDb) {
  return {
    player: new PlayerRepository(db),
    room: new RoomRepository(db),
    roomPlayer: new RoomPlayerRepository(db),
    roomSpectator: new RoomSpectatorRepository(db),
    session: new SessionRepository(db),
  };
}

export function createRepositories(db: Db) {
  return {
    ...createRepositorySet(db),
    transaction: <T>(
      handler: (repositories: RepositorySet, tx: Transaction) => Promise<T>,
    ) => {
      return db.transaction((tx) => handler(createRepositorySet(tx), tx));
    },
  };
}

export { PlayerRepository } from "./player.repository.js";
export { RoomPlayerRepository } from "./room-player.repository.js";
export { RoomSpectatorRepository } from "./room-spectator.repository.js";
export { RoomRepository } from "./room.repository.js";
export { SessionRepository } from "./session.repository.js";
export type { RepositoryDb, Transaction } from "./types.js";
