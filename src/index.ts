import ora from "ora";
import pLimit from "p-limit";

import { connect } from "./lib/db.js";
import { readAllImageFiles } from "./lib/fs.js";
import { exit, exitWithError } from "./lib/process.js";
import loadSchemas from "./schemas/index.js";
import { uploadImage } from "./upload.js";

const main = async () => {
  // start spinner
  const spinner = ora();
  spinner.start("Starting upload...\n");

  // connect db
  const dbConnectResult = await connect();
  if (dbConnectResult.isErr()) {
    exitWithError(dbConnectResult.error, spinner);
    return;
  }
  const { papr } = dbConnectResult.value;
  spinner.info("🔌 Connected to MongoDB\n");

  // load schemas
  const schemasResult = await loadSchemas(papr);
  if (schemasResult.isErr()) {
    exitWithError(schemasResult.error, spinner);
    return;
  }
  const schemas = schemasResult.value;
  spinner.info("⚙️ Loaded schemas\n");

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
        const result = await uploadImage(imageFilePath, schemas, spinner);
        if (result.isErr()) {
          spinner.warn(
            `========================================\n❌ Failed to upload ${imageFilePath}\nError: ${result.error.message}\n========================================\n\n`
          );
        }
      })
    );
  }
  await Promise.all(promises);

  spinner.succeed("✅ Uploaded all images\n");
  exit();
};

main();
