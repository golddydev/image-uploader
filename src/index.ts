import ora from "ora";
import pLimit from "p-limit";

import { readAllImageFiles } from "./lib/fs.js";
import { exit, exitWithError } from "./lib/process.js";
import { uploadImage } from "./upload.js";

const main = async () => {
  // start spinner
  const spinner = ora();
  spinner.start("Starting upload...\n");

  // read all image files
  const readAllImageFilePathsResult = await readAllImageFiles();
  if (readAllImageFilePathsResult.isErr()) {
    exitWithError(readAllImageFilePathsResult.error, spinner);
    return;
  }
  const imageFilePaths = readAllImageFilePathsResult.value;
  spinner.info("📂 Read all image files\n");
  spinner.info(`🔍 Found ${imageFilePaths.length} image files\n`);

  // upload image files
  // 5 at a time
  const limit = pLimit(5);
  const promises = [];
  for (const imageFilePath of imageFilePaths) {
    promises.push(
      limit(async () => {
        await uploadImage(imageFilePath, spinner);
      })
    );
  }
  await Promise.all(promises);

  spinner.succeed("✅ Uploaded all images\n");
  exit();
};

main();
