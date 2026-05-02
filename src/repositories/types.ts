import type { Db } from "../plugins/drizzle.js";

export type Transaction = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type RepositoryDb = Db | Transaction;
