import { ObjectId } from "mongodb";
import { ResultAsync } from "neverthrow";

import convertError from "./lib/error.js";
import { Schema } from "./schemas/file.js";

const findFileByHash = ResultAsync.fromThrowable(
  async (hash: string, fileSchema: Schema) => {
    const file = await fileSchema.findOne({ hash });
    return file;
  },
  (error) => new Error(`Failed to find file by hash. ${convertError(error)}`)
);

const updateFileName = ResultAsync.fromThrowable(
  async (fileId: string, fileName: string, fileSchema: Schema) => {
    const file = await fileSchema.updateOne(
      { _id: new ObjectId(fileId) },
      { $set: { name: fileName } }
    );
    return file;
  },
  (error) => new Error(`Failed to update file name. ${convertError(error)}`)
);

const createFile = ResultAsync.fromThrowable(
  async (
    name: string,
    path: string,
    mimeType: string,
    size: number,
    hash: string,
    cid: string,
    url: string,
    fileSchema: Schema
  ) => {
    const file = await fileSchema.insertOne({
      name,
      path,
      mimeType,
      size,
      hash,
      cid,
      url,
    });
    return file;
  },
  (error) => new Error(`Failed to create file. ${convertError(error)}`)
);

export { createFile, findFileByHash, updateFileName };
