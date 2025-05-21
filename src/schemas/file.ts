import { Db } from "mongodb";
import Papr, { schema, types } from "papr";

const name = "file";

const createModel = (papr: Papr) =>
  papr.model(
    name,
    schema(
      {
        name: types.string({ required: true }),
        path: types.string({ required: true }),
        size: types.number({ required: true }),
        mimeType: types.string({ required: true }),
        hash: types.string({ required: true }),
        cid: types.string({ required: true }),
      },
      {
        timestamps: true,
      }
    )
  );

const createIndexes = async (db: Db) => {
  await db.collection(name).createIndex({ hash: 1 }, { unique: true });
  await db.collection(name).createIndex({ cid: 1 }, { unique: true });
};

type Schema = ReturnType<typeof createModel>;

export default createModel;
export { createIndexes };
export type { Schema };
