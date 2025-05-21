import { Ora } from "ora";

const exitWithError = (error: Error, spinner: Ora) => {
  spinner.fail(error.message);
  process.exit(1);
};

const exit = () => {
  process.exit(0);
};

export { exit, exitWithError };
