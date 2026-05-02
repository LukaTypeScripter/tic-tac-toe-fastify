import { and, eq, gt, lt } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { SESSION_TABLE } from "../db/schema.js";
import type { RepositoryDb } from "./types.js";

export type Session = InferSelectModel<typeof SESSION_TABLE>;
export type NewSession = InferInsertModel<typeof SESSION_TABLE>;

export class SessionRepository {
  constructor(private readonly db: RepositoryDb) {}

  async create(session: NewSession) {
    const [created] = await this.db.insert(SESSION_TABLE).values(session).returning();
    return created;
  }

  async upsert(session: NewSession) {
    const [saved] = await this.db
      .insert(SESSION_TABLE)
      .values(session)
      .onConflictDoUpdate({
        target: SESSION_TABLE.id,
        set: {
          playerId: session.playerId,
          roomId: session.roomId,
          role: session.role,
          updatedAt: new Date(),
          expiresAt: session.expiresAt,
        },
      })
      .returning();

    return saved;
  }

  findAll() {
    return this.db.select().from(SESSION_TABLE);
  }

  async findById(id: string) {
    const [session] = await this.db
      .select()
      .from(SESSION_TABLE)
      .where(eq(SESSION_TABLE.id, id))
      .limit(1);

    return session;
  }

  async findActiveById(id: string, now = new Date()) {
    const [session] = await this.db
      .select()
      .from(SESSION_TABLE)
      .where(and(eq(SESSION_TABLE.id, id), gt(SESSION_TABLE.expiresAt, now)))
      .limit(1);

    return session;
  }

  findByPlayerId(playerId: string) {
    return this.db
      .select()
      .from(SESSION_TABLE)
      .where(eq(SESSION_TABLE.playerId, playerId));
  }

  findByRoomId(roomId: string) {
    return this.db
      .select()
      .from(SESSION_TABLE)
      .where(eq(SESSION_TABLE.roomId, roomId));
  }

  async update(id: string, changes: Partial<Omit<NewSession, "id">>) {
    const [updated] = await this.db
      .update(SESSION_TABLE)
      .set({
        ...changes,
        updatedAt: new Date(),
      })
      .where(eq(SESSION_TABLE.id, id))
      .returning();

    return updated;
  }

  async touch(id: string, expiresAt?: Date) {
    return this.update(id, {
      ...(expiresAt ? { expiresAt } : {}),
      updatedAt: new Date(),
    });
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .delete(SESSION_TABLE)
      .where(eq(SESSION_TABLE.id, id))
      .returning();

    return deleted;
  }

  deleteExpired(now = new Date()) {
    return this.db
      .delete(SESSION_TABLE)
      .where(lt(SESSION_TABLE.expiresAt, now))
      .returning();
  }
}
