import fg from "fast-glob";
import { ResultAsync } from "neverthrow";

import getEnvConfig from "../configs/index.js";
import convertError from "./error.js";

const readAllImageFiles = ResultAsync.fromThrowable(
  async () => {
    const files = await fg.async("**/*.{png,jpg,jpeg,gif,webp}", {
      cwd: getEnvConfig().IMAGES_FOLDER_PATH,
      absolute: true,
    });
    return files;
  },
  (error) => new Error(`Failed to read all image files. ${convertError(error)}`)
);

export { readAllImageFiles };
