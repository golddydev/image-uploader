import { Ora } from "ora";

export const logWarn = (spinner: Ora, message: string) => {
  spinner.warn(
    `========================================\n❌ ${message}\n========================================\n\n`
  );
};

export const logSuccess = (spinner: Ora, message: string) => {
  spinner.succeed(`✅ ${message}\n`);
};
