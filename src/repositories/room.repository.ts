import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { ROOM_TABLE } from "../db/schema.js";
import type { RepositoryDb } from "./types.js";

export type Room = InferSelectModel<typeof ROOM_TABLE>;
export type NewRoom = InferInsertModel<typeof ROOM_TABLE>;

export class RoomRepository {
  constructor(private readonly db: RepositoryDb) {}

  async create(room: NewRoom) {
    const [created] = await this.db.insert(ROOM_TABLE).values(room).returning();
    return created;
  }

  findAll() {
    return this.db.select().from(ROOM_TABLE);
  }

  async findById(id: string) {
    const [room] = await this.db
      .select()
      .from(ROOM_TABLE)
      .where(eq(ROOM_TABLE.id, id))
      .limit(1);

    return room;
  }

  async update(id: string, changes: Partial<Omit<NewRoom, "id">>) {
    const [updated] = await this.db
      .update(ROOM_TABLE)
      .set(changes)
      .where(eq(ROOM_TABLE.id, id))
      .returning();

    return updated;
  }

  async updateBoard(id: string, board: NewRoom["board"]) {
    return this.update(id, { board });
  }

  async updateTurn(id: string, turn: NewRoom["turn"]) {
    return this.update(id, { turn });
  }

  async setWinner(id: string, winnerId: string | null) {
    return this.update(id, { winnerId });
  }

  async reset(id: string) {
    return this.update(id, {
      board: ["EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY"],
      turn: "X",
      winnerId: null,
    });
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .delete(ROOM_TABLE)
      .where(eq(ROOM_TABLE.id, id))
      .returning();

    return deleted;
  }
}
