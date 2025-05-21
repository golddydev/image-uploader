import { fileTypeFromBuffer } from "file-type";
import fs from "fs/promises";
import { hash } from "hasha";
import { err, ok, Result } from "neverthrow";
import { ResultAsync } from "neverthrow";
import path from "path";

import convertError from "./lib/error.js";

const analyzeFile = async (
  filePath: string
): Promise<
  Result<
    { filename: string; hash: string; blob: Blob; mimeType: string },
    Error
  >
> => {
  // parse path
  const filename = path.basename(filePath);

  // read file
  const readableStreamResult = await ResultAsync.fromThrowable(
    () => fs.readFile(filePath),
    (error) => new Error(`Failed to read file. ${convertError(error)}`)
  )();
  if (readableStreamResult.isErr()) {
    return err(readableStreamResult.error);
  }
  const readableStream = readableStreamResult.value;

  // get mime type
  const mimeTypeResult = await ResultAsync.fromThrowable(
    () => fileTypeFromBuffer(readableStream),
    (error) => new Error(`Failed to get mime type. ${convertError(error)}`)
  )();
  if (mimeTypeResult.isErr()) {
    return err(mimeTypeResult.error);
  }
  const mimeType = mimeTypeResult.value?.mime;
  if (!mimeType) {
    return err(new Error("Failed to get mime type"));
  }
  if (!mimeType.startsWith("image/")) {
    return err(new Error("File is not an image"));
  }

  // get hash of file
  const hashResult = await ResultAsync.fromThrowable(
    () => hash(readableStream),
    (error) => new Error(`Failed to hash file. ${convertError(error)}`)
  )();
  if (hashResult.isErr()) {
    return err(hashResult.error);
  }
  const imageHash = hashResult.value;

  // check database if there is hash or not
  return ok({
    filename,
    hash: imageHash,
    blob: new Blob([readableStream], { type: mimeType }),
    mimeType,
  });
};

export { analyzeFile };
