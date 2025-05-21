import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envConfigSchema = z.object({
  IMAGES_FOLDER_PATH: z.string().min(1, "IMAGES_FOLDER_PATH is required"),
  PINATA_JWT: z.string().min(1, "PINATA_JWT is required"),
  PINATA_GATEWAY_URL: z.string().min(1, "PINATA_GATEWAY_URL is required"),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
});

type EnvConfigSchemaType = z.infer<typeof envConfigSchema>;

let envConfig: EnvConfigSchemaType;

const validateEnvConfig = () => {
  const parsedResult = envConfigSchema.safeParse(process.env);

  if (!parsedResult.success) {
    console.error(parsedResult.error.message);
    process.exit(1);
  }

  envConfig = parsedResult.data;
};

const getEnvConfig = () => {
  if (!envConfig) {
    validateEnvConfig();
  }

  return envConfig;
};

export default getEnvConfig;
