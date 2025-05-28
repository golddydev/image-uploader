import {
  BatchWriteItemCommand,
  BatchWriteItemCommandOutput,
  PutItemCommand,
  PutItemCommandOutput,
  WriteRequest,
} from "@aws-sdk/client-dynamodb";

import getDynamoDBClient from "./client.js";
import { TABLE_NAME } from "./configs.js";

interface Item {
  name: string;
  status: "pending" | "minted" | "minting" | "failed";
  ipfsCid: string;
  ipfsUrl: string;
}

export const putItem = async (item: Item): Promise<PutItemCommandOutput> => {
  const client = getDynamoDBClient();

  const command = new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      name: { S: item.name },
      status: { S: item.status },
      ipfsCid: { S: item.ipfsCid },
      ipfsUrl: { S: item.ipfsUrl },
    },
  });

  return await client.send(command);
};

// DynamoDB allows up to 25 items per batch
export const batchWriteItems = async (
  requests: WriteRequest[]
): Promise<BatchWriteItemCommandOutput> => {
  const client = getDynamoDBClient();

  if (requests.length > 25) {
    throw new Error("DynamoDB allows up to 25 items per batch");
  }

  const command = new BatchWriteItemCommand({
    RequestItems: {
      [TABLE_NAME]: requests,
    },
  });
  return await client.send(command);
};

export const makeBatchWriteRequests = (items: Item[]): WriteRequest[] =>
  items.map((item) => ({
    PutRequest: {
      Item: {
        name: { S: item.name },
        status: { S: item.status },
        ipfsCid: { S: item.ipfsCid },
        ipfsUrl: { S: item.ipfsUrl },
      },
    },
  }));
