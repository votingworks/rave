/* Generated by res-to-ts. DO NOT EDIT */
/* eslint-disable */
/* istanbul ignore file */

import { Buffer } from 'buffer';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';

/**
 * Data of data/electionMultiPartyPrimary/legacy-cvr-files/standard.jsonl encoded as base64.
 *
 * SHA-256 hash of file data: d92c0b80b8754ccef90a82a7121b4caa08909e6a4fe5b9fe604cd6ca0112cd85
 */

/**
 * MIME type of data/electionMultiPartyPrimary/legacy-cvr-files/standard.jsonl.
 */
export const mimeType = 'application/jsonlines';

/**
 * Path to a file containing this file's contents.
 *
 * SHA-256 hash of file data: d92c0b80b8754ccef90a82a7121b4caa08909e6a4fe5b9fe604cd6ca0112cd85
 */
export function asFilePath(): string {
  const directoryPath = mkdtempSync(tmpdir() + sep);
  const filePath = join(directoryPath, 'standard.jsonl');
  writeFileSync(filePath, asBuffer());
  return filePath;
}

/**
 * Convert to a `data:` URL of data/electionMultiPartyPrimary/legacy-cvr-files/standard.jsonl, suitable for embedding in HTML.
 *
 * SHA-256 hash of file data: d92c0b80b8754ccef90a82a7121b4caa08909e6a4fe5b9fe604cd6ca0112cd85
 */
export function asDataUrl(): string {
  return `data:${mimeType};base64,${resourceDataBase64}`;
}

/**
 * Raw data of data/electionMultiPartyPrimary/legacy-cvr-files/standard.jsonl.
 *
 * SHA-256 hash of file data: d92c0b80b8754ccef90a82a7121b4caa08909e6a4fe5b9fe604cd6ca0112cd85
 */
export function asBuffer(): Buffer {
  return Buffer.from(resourceDataBase64, 'base64');
}

/**
 * Text content of data/electionMultiPartyPrimary/legacy-cvr-files/standard.jsonl.
 *
 * SHA-256 hash of file data: d92c0b80b8754ccef90a82a7121b4caa08909e6a4fe5b9fe604cd6ca0112cd85
 */
export function asText(): string {
  return asBuffer().toString('utf-8');
}