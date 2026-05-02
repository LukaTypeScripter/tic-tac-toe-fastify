import { and, eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { ROOM_SPECTATOR_TABLE } from "../db/schema.js";
import type { RepositoryDb } from "./types.js";

export type RoomSpectator = InferSelectModel<typeof ROOM_SPECTATOR_TABLE>;
export type NewRoomSpectator = InferInsertModel<typeof ROOM_SPECTATOR_TABLE>;

export class RoomSpectatorRepository {
  constructor(private readonly db: RepositoryDb) {}

  async add(roomSpectator: NewRoomSpectator) {
    const [created] = await this.db
      .insert(ROOM_SPECTATOR_TABLE)
      .values(roomSpectator)
      .returning();

    return created;
  }

  async upsert(roomSpectator: NewRoomSpectator) {
    const [saved] = await this.db
      .insert(ROOM_SPECTATOR_TABLE)
      .values(roomSpectator)
      .onConflictDoNothing()
      .returning();

    return saved;
  }

  findAll() {
    return this.db.select().from(ROOM_SPECTATOR_TABLE);
  }

  findByRoomId(roomId: string) {
    return this.db
      .select()
      .from(ROOM_SPECTATOR_TABLE)
      .where(eq(ROOM_SPECTATOR_TABLE.roomId, roomId));
  }

  findByPlayerId(playerId: string) {
    return this.db
      .select()
      .from(ROOM_SPECTATOR_TABLE)
      .where(eq(ROOM_SPECTATOR_TABLE.playerId, playerId));
  }

  async findOne(roomId: string, playerId: string) {
    const [roomSpectator] = await this.db
      .select()
      .from(ROOM_SPECTATOR_TABLE)
      .where(
        and(
          eq(ROOM_SPECTATOR_TABLE.roomId, roomId),
          eq(ROOM_SPECTATOR_TABLE.playerId, playerId),
        ),
      )
      .limit(1);

    return roomSpectator;
  }

  async remove(roomId: string, playerId: string) {
    const [deleted] = await this.db
      .delete(ROOM_SPECTATOR_TABLE)
      .where(
        and(
          eq(ROOM_SPECTATOR_TABLE.roomId, roomId),
          eq(ROOM_SPECTATOR_TABLE.playerId, playerId),
        ),
      )
      .returning();

    return deleted;
  }

  removeByRoomId(roomId: string) {
    return this.db
      .delete(ROOM_SPECTATOR_TABLE)
      .where(eq(ROOM_SPECTATOR_TABLE.roomId, roomId))
      .returning();
  }
}
