import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

export const TABLE_NAME = "ImageUploads";

export const DB_CLIENT_CONFIG: DynamoDBClientConfig = {
  region: "us-west-2",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "dummyAccessKey",
    secretAccessKey: "dummySecretKey",
  },
};
