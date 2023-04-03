/* Generated by res-to-ts. DO NOT EDIT */
/* eslint-disable */
/* istanbul ignore file */

import { Buffer } from 'buffer';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';

/**
 * Data of data/sampleAdminInitialSetupPackage/systemSettings.json encoded as base64.
 *
 * SHA-256 hash of file data: ad5f55cd7aa2ba3208e4e74f1480a33341edc354a29924d5f71bd932bc4d9748
 */
const resourceDataBase64 = 'ewogICJhcmVQb2xsV29ya2VyQ2FyZFBpbnNFbmFibGVkIjogdHJ1ZQp9Cg==';

/**
 * MIME type of data/sampleAdminInitialSetupPackage/systemSettings.json.
 */
export const mimeType = 'application/json';

/**
 * Path to a file containing this file's contents.
 *
 * SHA-256 hash of file data: ad5f55cd7aa2ba3208e4e74f1480a33341edc354a29924d5f71bd932bc4d9748
 */
export function asFilePath(): string {
  const directoryPath = mkdtempSync(tmpdir() + sep);
  const filePath = join(directoryPath, 'systemSettings.json');
  writeFileSync(filePath, asBuffer());
  return filePath;
}

/**
 * Convert to a `data:` URL of data/sampleAdminInitialSetupPackage/systemSettings.json, suitable for embedding in HTML.
 *
 * SHA-256 hash of file data: ad5f55cd7aa2ba3208e4e74f1480a33341edc354a29924d5f71bd932bc4d9748
 */
export function asDataUrl(): string {
  return `data:${mimeType};base64,${resourceDataBase64}`;
}

/**
 * Raw data of data/sampleAdminInitialSetupPackage/systemSettings.json.
 *
 * SHA-256 hash of file data: ad5f55cd7aa2ba3208e4e74f1480a33341edc354a29924d5f71bd932bc4d9748
 */
export function asBuffer(): Buffer {
  return Buffer.from(resourceDataBase64, 'base64');
}

/**
 * Text content of data/sampleAdminInitialSetupPackage/systemSettings.json.
 *
 * SHA-256 hash of file data: ad5f55cd7aa2ba3208e4e74f1480a33341edc354a29924d5f71bd932bc4d9748
 */
export function asText(): string {
  return asBuffer().toString('utf-8');
}