import { ResultAsync } from "neverthrow";

import { InitializedPapr } from "../lib/db.js";
import convertError from "../lib/error.js";
import createFileSchema, {
  createIndexes as createFileSchemaIndexes,
  Schema as FileSchema,
} from "./file.js";

const load = ResultAsync.fromThrowable(
  async (papr: InitializedPapr) => {
    const schemas: Schemas = {
      file: createFileSchema(papr),
    };
    await papr.updateSchemas();
    await createFileSchemaIndexes(papr.db);

    return schemas;
  },
  (error) => new Error(`Failed to load schemas. ${convertError(error)}`)
);

type Schemas = {
  file: FileSchema;
};

export default load;
export type { Schemas };
