import { fileTypeFromBuffer } from "file-type";
import fs from "fs/promises";
import { err, ok, Result } from "neverthrow";
import { ResultAsync } from "neverthrow";
import path from "path";

import convertError from "./lib/error.js";

export interface AnalyzeFileResult {
  filename: string;
  file: File;
  fileSize: number;
  mimeType: string;
}

export const analyzeFile = async (
  filePath: string
): Promise<Result<AnalyzeFileResult, Error>> => {
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

  const blob = new Blob([readableStream], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });

  return ok({
    filename,
    file,
    fileSize: file.size,
    mimeType,
  });
};
