import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DB_CLIENT_CONFIG } from "./configs.js";

let client: DynamoDBClient;

const initClient = () => {
  client = new DynamoDBClient(DB_CLIENT_CONFIG);
};

const getDynamoDBClient = () => {
  if (!client) {
    initClient();
  }
  return client;
};

export default getDynamoDBClient;
