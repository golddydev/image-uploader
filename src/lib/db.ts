import { Db, MongoClient } from "mongodb";
import { ResultAsync } from "neverthrow";
import Papr from "papr";

import getEnvConfig from "../configs/index.js";
import convertError from "./error.js";

type InitializedPapr = Papr & { db: Db };

const connect = ResultAsync.fromThrowable(
  async () => {
    const client = new MongoClient(getEnvConfig().MONGO_URI);
    await client.connect();
    const db = client.db();
    return { client, db, papr: initPapr(db) };
  },
  (error) =>
    new Error(`Failed to connect MongoDB Client. ${convertError(error)}`)
);

const initPapr = (db: Db) => {
  const papr = new Papr();
  papr.initialize(db);
  return papr as InitializedPapr;
};

export { connect, initPapr };
export type { InitializedPapr };
