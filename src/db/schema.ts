import {pgEnum, pgTable, primaryKey, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const playerMarkEnum = pgEnum("player_move_type", [
    "X",
    "O",
]);

export const cellEnum = pgEnum("cell", ["X", "O", "EMPTY"]);

export const sessionRoleEnum = pgEnum("session_role", [
    "player",
    "spectator",
]);


export const PLAYER_TABLE = pgTable('player', {
    id:  uuid("id").primaryKey().defaultRandom(),
    nickName: varchar('nick_name',{ length: 255 }).notNull(),
});

export const SESSION_TABLE  = pgTable('session', {
    id:  uuid("id").primaryKey().defaultRandom(),
    playerId: varchar('player_id', { length: 255 }).notNull().references(() => PLAYER_TABLE.id, { onDelete: 'cascade'}),
    roomId: varchar('room_id', { length: 255 }).references(() => ROOM_TABLE.id, { onDelete: 'set null'}),
    role: sessionRoleEnum('role').notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
});


export const ROOM_TABLE = pgTable('room', {
    id: varchar({ length: 255 }).primaryKey(),
    board: cellEnum("board").array().notNull().default(["EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY", "EMPTY"]),
    turn: playerMarkEnum('turn').notNull(),
    winnerId: varchar('winner_id', { length: 255 }).references(() => PLAYER_TABLE.id),
})

export const  ROOM_PLAYER_TABLE = pgTable('room_player', {
    roomId: varchar('room_id', { length: 255 }).notNull().references(() => ROOM_TABLE.id, { onDelete: 'cascade' }),

    playerId: varchar('player_id', { length: 255 }).notNull().references(() => PLAYER_TABLE.id, { onDelete: 'cascade' }),

    mark: playerMarkEnum('mark').notNull(),

},  (table) => [
        primaryKey({ columns: [table.roomId, table.playerId] }),
    ]
)


export const  ROOM_SPECTATOR_TABLE = pgTable('room_spectator', {
        roomId: varchar('room_id', { length: 255 }).notNull().references(() => ROOM_TABLE.id, { onDelete: 'cascade' }),

        playerId: varchar('player_id', { length: 255 }).notNull().references(() => PLAYER_TABLE.id, { onDelete: 'cascade' }),

    },  (table) => [
        primaryKey({ columns: [table.roomId, table.playerId] }),
    ]
)
