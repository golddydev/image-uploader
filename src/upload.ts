import { ResultAsync } from "neverthrow";
import { Ora } from "ora";

import { analyzeFile } from "./file.js";
import { putItem } from "./lib/dynamodb/index.js";
import convertError from "./lib/error.js";
import getPinataSDK from "./lib/pinata.js";
import { logSuccess, logWarn } from "./logger.js";

export const uploadImage = async (
  imageFilePath: string,
  spinner: Ora
): Promise<void> => {
  // analyze file
  const analyzeFileResult = await analyzeFile(imageFilePath);
  if (analyzeFileResult.isErr()) {
    logWarn(
      spinner,
      `Failed to analyze file ${analyzeFileResult.error.message}`
    );
    return;
  }
  const analyzeResult = analyzeFileResult.value;

  // check file size
  if (analyzeResult.fileSize > 5 * 1024 * 1024) {
    logWarn(spinner, `File ${analyzeResult.filename} is bigger than 5MB`);
    return;
  }

  // upload image
  const pinataSDK = getPinataSDK();
  const baseUrl = pinataSDK.config?.pinataGateway ?? "https://ipfs.io";

  const uploadResult = await ResultAsync.fromThrowable(
    async () => {
      const upload = await pinataSDK.upload.public.file(analyzeResult.file);
      return upload;
    },
    (error) => new Error(`Failed to upload images. ${convertError(error)}`)
  )();
  if (uploadResult.isErr()) {
    logWarn(spinner, uploadResult.error.message);
    return;
  }
  const upload = uploadResult.value;
  logSuccess(spinner, `Uploaded ${analyzeResult.filename} to IPFS.`);

  // write row to table
  const putResult = await ResultAsync.fromThrowable(
    async () =>
      putItem({
        name: analyzeResult.filename,
        status: "pending",
        ipfsCid: upload.cid,
        ipfsUrl: `${baseUrl}/ipfs/${upload.cid}`,
      }),
    (error) => new Error(`Failed to put item: ${convertError(error)}`)
  )();
  if (putResult.isErr()) {
    logWarn(spinner, putResult.error.message);
    return;
  }
  logSuccess(
    spinner,
    `Saved ${analyzeResult.filename} information to DynamoDB.`
  );
};
