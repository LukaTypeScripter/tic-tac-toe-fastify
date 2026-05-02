import { and, eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { ROOM_PLAYER_TABLE } from "../db/schema.js";
import type { RepositoryDb } from "./types.js";

export type RoomPlayer = InferSelectModel<typeof ROOM_PLAYER_TABLE>;
export type NewRoomPlayer = InferInsertModel<typeof ROOM_PLAYER_TABLE>;

export class RoomPlayerRepository {
  constructor(private readonly db: RepositoryDb) {}

  async add(roomPlayer: NewRoomPlayer) {
    const [created] = await this.db
      .insert(ROOM_PLAYER_TABLE)
      .values(roomPlayer)
      .returning();

    return created;
  }

  async upsert(roomPlayer: NewRoomPlayer) {
    const [saved] = await this.db
      .insert(ROOM_PLAYER_TABLE)
      .values(roomPlayer)
      .onConflictDoUpdate({
        target: [ROOM_PLAYER_TABLE.roomId, ROOM_PLAYER_TABLE.playerId],
        set: {
          mark: roomPlayer.mark,
        },
      })
      .returning();

    return saved;
  }

  findAll() {
    return this.db.select().from(ROOM_PLAYER_TABLE);
  }

  findByRoomId(roomId: string) {
    return this.db
      .select()
      .from(ROOM_PLAYER_TABLE)
      .where(eq(ROOM_PLAYER_TABLE.roomId, roomId));
  }

  findByPlayerId(playerId: string) {
    return this.db
      .select()
      .from(ROOM_PLAYER_TABLE)
      .where(eq(ROOM_PLAYER_TABLE.playerId, playerId));
  }

  async findOne(roomId: string, playerId: string) {
    const [roomPlayer] = await this.db
      .select()
      .from(ROOM_PLAYER_TABLE)
      .where(
        and(
          eq(ROOM_PLAYER_TABLE.roomId, roomId),
          eq(ROOM_PLAYER_TABLE.playerId, playerId),
        ),
      )
      .limit(1);

    return roomPlayer;
  }

  async updateMark(roomId: string, playerId: string, mark: NewRoomPlayer["mark"]) {
    const [updated] = await this.db
      .update(ROOM_PLAYER_TABLE)
      .set({ mark })
      .where(
        and(
          eq(ROOM_PLAYER_TABLE.roomId, roomId),
          eq(ROOM_PLAYER_TABLE.playerId, playerId),
        ),
      )
      .returning();

    return updated;
  }

  async remove(roomId: string, playerId: string) {
    const [deleted] = await this.db
      .delete(ROOM_PLAYER_TABLE)
      .where(
        and(
          eq(ROOM_PLAYER_TABLE.roomId, roomId),
          eq(ROOM_PLAYER_TABLE.playerId, playerId),
        ),
      )
      .returning();

    return deleted;
  }

  removeByRoomId(roomId: string) {
    return this.db
      .delete(ROOM_PLAYER_TABLE)
      .where(eq(ROOM_PLAYER_TABLE.roomId, roomId))
      .returning();
  }
}
