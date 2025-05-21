import { err, ok, Result, ResultAsync } from "neverthrow";
import { Ora } from "ora";

import { analyzeFile } from "./file.js";
import convertError from "./lib/error.js";
import getPinataSDK from "./lib/pinata.js";
import { createFile, findFileByHash, updateFileName } from "./repo.js";
import { Schemas } from "./schemas/index.js";

const uploadImage = async (
  imageFilePath: string,
  schemas: Schemas,
  spinner: Ora
): Promise<Result<void, Error>> => {
  // analyze file
  const analyzeFileResult = await analyzeFile(imageFilePath);
  if (analyzeFileResult.isErr()) {
    return err(analyzeFileResult.error);
  }
  const { filename, hash, blob, mimeType } = analyzeFileResult.value;

  // check database if there is hash or not
  const foundResult = await findFileByHash(hash, schemas.file);
  if (foundResult.isErr()) {
    return err(foundResult.error);
  }
  const found = foundResult.value;
  if (found) {
    spinner.info(`🔁 Skipped ${filename} — already uploaded (same hash)\n`);
    if (found.name !== filename) {
      const updateFileNameResult = await updateFileName(
        found._id.toString(),
        filename,
        schemas.file
      );
      if (updateFileNameResult.isErr()) {
        return err(updateFileNameResult.error);
      }
      spinner.info(`✏️ Updated filename of ${found.name} to ${filename}\n`);
    }
    return ok();
  }

  // upload image
  const pinataSDK = getPinataSDK();

  const file = new File([blob], filename, { type: mimeType });

  // check file's size
  if (file.size > 5 * 1024 * 1024) {
    return err(new Error("File is bigger than 5MB"));
  }

  const uploadResult = await ResultAsync.fromThrowable(
    async () => {
      const upload = await pinataSDK.upload.public.file(file);
      return upload;
    },
    (error) => new Error(`Failed to upload image. ${convertError(error)}`)
  )();
  if (uploadResult.isErr()) {
    return err(uploadResult.error);
  }
  const upload = uploadResult.value;
  spinner.info(`✅ Uploaded ${filename}\n`);

  // create file document on database
  const baseUrl = getPinataSDK().config?.pinataGateway ?? "https://ipfs.io";
  const createFileResult = await createFile(
    filename,
    imageFilePath,
    mimeType,
    upload.size,
    hash,
    upload.cid,
    `${baseUrl}/ipfs/${upload.cid}`,
    schemas.file
  );
  if (createFileResult.isErr()) {
    return err(createFileResult.error);
  }
  spinner.info(`💾 Saved uploaded info of ${filename} to database\n`);

  return ok();
};

export { uploadImage };
