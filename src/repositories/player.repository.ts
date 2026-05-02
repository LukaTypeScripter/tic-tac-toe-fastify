import {eq, inArray} from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { PLAYER_TABLE } from "../db/schema.js";
import type { RepositoryDb } from "./types.js";

export type Player = InferSelectModel<typeof PLAYER_TABLE>;
export type NewPlayer = InferInsertModel<typeof PLAYER_TABLE>;

export class PlayerRepository {
  constructor(private readonly db: RepositoryDb) {}

  async create(player: NewPlayer) {
    const [created] = await this.db.insert(PLAYER_TABLE).values(player).returning();
    return created;
  }

  async upsert(player: NewPlayer) {
    const [saved] = await this.db
      .insert(PLAYER_TABLE)
      .values(player)
      .onConflictDoUpdate({
        target: PLAYER_TABLE.id,
        set: {
          nickName: player.nickName,
        },
      })
      .returning();

    return saved;
  }

  findAll() {
    return this.db.select().from(PLAYER_TABLE);
  }



  async findByIds(ids: string[]) {
    const players = await this.db
      .select()
      .from(PLAYER_TABLE)
      .where(inArray(PLAYER_TABLE.id, ids))
      .limit(ids.length);

    return players;
  }

  async update(id: string, changes: Partial<Omit<NewPlayer, "id">>) {
    const [updated] = await this.db
      .update(PLAYER_TABLE)
      .set(changes)
      .where(eq(PLAYER_TABLE.id, id))
      .returning();

    return updated;
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .delete(PLAYER_TABLE)
      .where(eq(PLAYER_TABLE.id, id))
      .returning();

    return deleted;
  }
}
