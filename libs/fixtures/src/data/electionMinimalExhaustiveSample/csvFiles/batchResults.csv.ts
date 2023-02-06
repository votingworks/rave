/* Generated by res-to-ts. DO NOT EDIT */
/* eslint-disable */
/* istanbul ignore file */

import { Buffer } from 'buffer';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';

/**
 * Data of data/electionMinimalExhaustiveSample/csvFiles/batchResults.csv encoded as base64.
 *
 * SHA-256 hash of file data: be48659ccdf207be8ce1a0c2c0a293f5c98b7e12ad6934586d08129baf4b6b16
 */
const resourceDataBase64 = 'QmF0Y2ggSUQsQmF0Y2ggTmFtZSxUYWJ1bGF0b3IsTnVtYmVyIG9mIEJhbGxvdHMsIk1hbW1hbCBQYXJ0eSBCZXN0IEFuaW1hbCAtIEJhbGxvdHMgQ2FzdCIsIk1hbW1hbCBQYXJ0eSBCZXN0IEFuaW1hbCAtIFVuZGVydm90ZXMiLCJNYW1tYWwgUGFydHkgQmVzdCBBbmltYWwgLSBPdmVydm90ZXMiLCJNYW1tYWwgUGFydHkgQmVzdCBBbmltYWwgLSBIb3JzZSIsIk1hbW1hbCBQYXJ0eSBCZXN0IEFuaW1hbCAtIE90dGVyIiwiTWFtbWFsIFBhcnR5IEJlc3QgQW5pbWFsIC0gRm94IiwiRmlzaCBQYXJ0eSBCZXN0IEFuaW1hbCAtIEJhbGxvdHMgQ2FzdCIsIkZpc2ggUGFydHkgQmVzdCBBbmltYWwgLSBVbmRlcnZvdGVzIiwiRmlzaCBQYXJ0eSBCZXN0IEFuaW1hbCAtIE92ZXJ2b3RlcyIsIkZpc2ggUGFydHkgQmVzdCBBbmltYWwgLSBTZWFob3JzZSIsIkZpc2ggUGFydHkgQmVzdCBBbmltYWwgLSBTYWxtb24iLCJNYW1tYWwgUGFydHkgWm9vIENvdW5jaWwgLSBCYWxsb3RzIENhc3QiLCJNYW1tYWwgUGFydHkgWm9vIENvdW5jaWwgLSBVbmRlcnZvdGVzIiwiTWFtbWFsIFBhcnR5IFpvbyBDb3VuY2lsIC0gT3ZlcnZvdGVzIiwiTWFtbWFsIFBhcnR5IFpvbyBDb3VuY2lsIC0gWmVicmEiLCJNYW1tYWwgUGFydHkgWm9vIENvdW5jaWwgLSBMaW9uIiwiTWFtbWFsIFBhcnR5IFpvbyBDb3VuY2lsIC0gS2FuZ2Fyb28iLCJNYW1tYWwgUGFydHkgWm9vIENvdW5jaWwgLSBFbGVwaGFudCIsIk1hbW1hbCBQYXJ0eSBab28gQ291bmNpbCAtIFdyaXRlIEluIiwiRmlzaCBQYXJ0eSBab28gQ291bmNpbCAtIEJhbGxvdHMgQ2FzdCIsIkZpc2ggUGFydHkgWm9vIENvdW5jaWwgLSBVbmRlcnZvdGVzIiwiRmlzaCBQYXJ0eSBab28gQ291bmNpbCAtIE92ZXJ2b3RlcyIsIkZpc2ggUGFydHkgWm9vIENvdW5jaWwgLSBNYW50YSBSYXkiLCJGaXNoIFBhcnR5IFpvbyBDb3VuY2lsIC0gUHVmZmVyZmlzaCIsIkZpc2ggUGFydHkgWm9vIENvdW5jaWwgLSBSb2NrZmlzaCIsIkZpc2ggUGFydHkgWm9vIENvdW5jaWwgLSBUcmlnZ2VyZmlzaCIsIkZpc2ggUGFydHkgWm9vIENvdW5jaWwgLSBXcml0ZSBJbiIsIk1hbW1hbCBQYXJ0eSBCYWxsb3QgTWVhc3VyZSAxIC0gQmFsbG90cyBDYXN0IiwiTWFtbWFsIFBhcnR5IEJhbGxvdCBNZWFzdXJlIDEgLSBVbmRlcnZvdGVzIiwiTWFtbWFsIFBhcnR5IEJhbGxvdCBNZWFzdXJlIDEgLSBPdmVydm90ZXMiLCJNYW1tYWwgUGFydHkgQmFsbG90IE1lYXN1cmUgMSAtIFllcyIsIk1hbW1hbCBQYXJ0eSBCYWxsb3QgTWVhc3VyZSAxIC0gTm8iLCJNYW1tYWwgUGFydHkgQmFsbG90IE1lYXN1cmUgMSAtIEJhbGxvdHMgQ2FzdCIsIk1hbW1hbCBQYXJ0eSBCYWxsb3QgTWVhc3VyZSAxIC0gVW5kZXJ2b3RlcyIsIk1hbW1hbCBQYXJ0eSBCYWxsb3QgTWVhc3VyZSAxIC0gT3ZlcnZvdGVzIiwiTWFtbWFsIFBhcnR5IEJhbGxvdCBNZWFzdXJlIDEgLSBZZXMiLCJNYW1tYWwgUGFydHkgQmFsbG90IE1lYXN1cmUgMSAtIE5vIiwiRmlzaCBQYXJ0eSBCYWxsb3QgTWVhc3VyZSAzIC0gQmFsbG90cyBDYXN0IiwiRmlzaCBQYXJ0eSBCYWxsb3QgTWVhc3VyZSAzIC0gVW5kZXJ2b3RlcyIsIkZpc2ggUGFydHkgQmFsbG90IE1lYXN1cmUgMyAtIE92ZXJ2b3RlcyIsIkZpc2ggUGFydHkgQmFsbG90IE1lYXN1cmUgMyAtIFllcyIsIkZpc2ggUGFydHkgQmFsbG90IE1lYXN1cmUgMyAtIE5vIgptaXNzaW5nLWJhdGNoLWlkLE1pc3NpbmcgQmF0Y2gsc2Nhbm5lci0xLCBzY2FubmVyLTIsMzAwMCwxNDkwLDEyNSwxOTQsMTIzLDk1LDk1MywxNTEwLDEyMCwxMTksNzMsMTE5OCwxNDkwLDY0NiwzNjksNzgwLDc2OSw2ODAsNTc3LDY0OSwxNTEwLDM1OSwzMDYsNTg2LDQ1NCwzNjksNDA4LDUzOCwxNDkwLDExNzEsMTE3LDEyNSw3NywxNDkwLDExNzEsMTE3LDEyNSw3NywxNTEwLDExOTgsNzMsMTIwLDExOQ==';

/**
 * MIME type of data/electionMinimalExhaustiveSample/csvFiles/batchResults.csv.
 */
export const mimeType = 'text/csv';

/**
 * Path to a file containing this file's contents.
 *
 * SHA-256 hash of file data: be48659ccdf207be8ce1a0c2c0a293f5c98b7e12ad6934586d08129baf4b6b16
 */
export function asFilePath(): string {
  const directoryPath = mkdtempSync(tmpdir() + sep);
  const filePath = join(directoryPath, 'batchResults.csv');
  writeFileSync(filePath, asBuffer());
  return filePath;
}

/**
 * Convert to a `data:` URL of data/electionMinimalExhaustiveSample/csvFiles/batchResults.csv, suitable for embedding in HTML.
 *
 * SHA-256 hash of file data: be48659ccdf207be8ce1a0c2c0a293f5c98b7e12ad6934586d08129baf4b6b16
 */
export function asDataUrl(): string {
  return `data:${mimeType};base64,${resourceDataBase64}`;
}

/**
 * Raw data of data/electionMinimalExhaustiveSample/csvFiles/batchResults.csv.
 *
 * SHA-256 hash of file data: be48659ccdf207be8ce1a0c2c0a293f5c98b7e12ad6934586d08129baf4b6b16
 */
export function asBuffer(): Buffer {
  return Buffer.from(resourceDataBase64, 'base64');
}

/**
 * Text content of data/electionMinimalExhaustiveSample/csvFiles/batchResults.csv.
 *
 * SHA-256 hash of file data: be48659ccdf207be8ce1a0c2c0a293f5c98b7e12ad6934586d08129baf4b6b16
 */
export function asText(): string {
  return asBuffer().toString('utf-8');
}