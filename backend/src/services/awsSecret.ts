import {
  SecretsManagerClient,
  CreateSecretCommand,
  GetSecretValueCommand,
  UpdateSecretCommand,
  DeleteSecretCommand,
  ListSecretsCommand,
  SecretListEntry,
} from "@aws-sdk/client-secrets-manager";
import "dotenv/config";
import { getEnv } from "../utility/env.js";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
  },
});

/**
 * Secret summary type
 */
export interface AwsSecretSummary {
  Name: string;
  ARN: string;
}

/**
 * List all AWS secrets
 */
export const listAwsSecrets = async (): Promise<AwsSecretSummary[]> => {
  const command = new ListSecretsCommand({
    MaxResults: 100,
  });

  const response = await client.send(command);

  return (response.SecretList || [])
    .filter((s: SecretListEntry) => s.Name && s.ARN)
    .map((s: SecretListEntry) => ({
      Name: s.Name as string,
      ARN: s.ARN as string,
    }));
};

/**
 * Create a new secret
 */
export const createSecret = async (
  name: string,
  value: string,
): Promise<string> => {
  const command = new CreateSecretCommand({
    Name: name,
    SecretString: value,
  });

  const response = await client.send(command);

  if (!response.ARN) {
    throw new Error("Failed to create secret");
  }

  return response.ARN;
};

/**
 * Get secret value
 */
export const getSecret = async (awsSecretId: string): Promise<string> => {
  const command = new GetSecretValueCommand({
    SecretId: awsSecretId,
  });

  const response = await client.send(command);

  if (!response.SecretString) {
    throw new Error("Secret value not found");
  }

  return response.SecretString;
};

/**
 * Update secret value
 */
export const updateSecret = async (
  awsSecretId: string,
  value: string,
): Promise<void> => {
  const command = new UpdateSecretCommand({
    SecretId: awsSecretId,
    SecretString: value,
  });

  await client.send(command);
};

/**
 * Delete secret permanently
 */
export const deleteSecret = async (awsSecretId: string): Promise<void> => {
  const command = new DeleteSecretCommand({
    SecretId: awsSecretId,
    ForceDeleteWithoutRecovery: true,
  });

  await client.send(command);
};

/**
 * Rotate secret (generate new value)
 */
export const rotateSecret = async (awsSecretId: string): Promise<string> => {
  const newValue = generateSecretValue();

  const command = new UpdateSecretCommand({
    SecretId: awsSecretId,
    SecretString: newValue,
  });

  await client.send(command);

  return newValue;
};

/**
 * Generate secure random secret value
 */
export const generateSecretValue = (length: number = 32): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};
