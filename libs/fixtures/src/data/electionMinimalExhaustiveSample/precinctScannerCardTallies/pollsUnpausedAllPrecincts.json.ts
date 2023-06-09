/* Generated by res-to-ts. DO NOT EDIT */
/* eslint-disable */
/* istanbul ignore file */

import { Buffer } from 'buffer';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';

/**
 * Data of data/electionMinimalExhaustiveSample/precinctScannerCardTallies/pollsUnpausedAllPrecincts.json encoded as base64.
 *
 * SHA-256 hash of file data: f21c6ae0b223abde04843c9633f49348d1386daf66aedd958e72fa08bc9b33e3
 */
const resourceDataBase64 = 'ewogICJ0YWxseU1hY2hpbmVUeXBlIjogInByZWNpbmN0X3NjYW5uZXIiLAogICJ0b3RhbEJhbGxvdHNTY2FubmVkIjogMCwKICAiaXNMaXZlTW9kZSI6IGZhbHNlLAogICJwb2xsc1RyYW5zaXRpb24iOiAidW5wYXVzZV9wb2xscyIsCiAgIm1hY2hpbmVJZCI6ICIwMDAwIiwKICAidGltZVNhdmVkIjogMTY2NTYxNjA2OTc2OSwKICAidGltZVBvbGxzVHJhbnNpdGlvbmVkIjogMTY2NTYxNjA2OTc2OSwKICAicHJlY2luY3RTZWxlY3Rpb24iOiB7CiAgICAia2luZCI6ICJBbGxQcmVjaW5jdHMiCiAgfSwKICAiYmFsbG90Q291bnRzIjogewogICAgIjAscHJlY2luY3QtMSI6IFswLCAwXSwKICAgICIwLHByZWNpbmN0LTIiOiBbMCwgMF0sCiAgICAiMSxwcmVjaW5jdC0xIjogWzAsIDBdLAogICAgIjEscHJlY2luY3QtMiI6IFswLCAwXSwKICAgICIwLF9fQUxMX1BSRUNJTkNUUyI6IFswLCAwXSwKICAgICIxLF9fQUxMX1BSRUNJTkNUUyI6IFswLCAwXQogIH0sCiAgInRhbGxpZXNCeVByZWNpbmN0IjogewogICAgInByZWNpbmN0LTEiOiBbCiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwXSwKICAgICAgWzAsIDAsIDAsIDAsIDAsIDBdLAogICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sCiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSwKICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLAogICAgICBbMCwgMCwgMCwgMCwgMF0KICAgIF0sCiAgICAicHJlY2luY3QtMiI6IFsKICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdLAogICAgICBbMCwgMCwgMCwgMCwgMCwgMF0sCiAgICAgIFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSwKICAgICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLAogICAgICBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sCiAgICAgIFswLCAwLCAwLCAwLCAwXQogICAgXQogIH0sCiAgInRhbGx5IjogWwogICAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdLAogICAgWzAsIDAsIDAsIDAsIDAsIDBdLAogICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLAogICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLAogICAgWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLAogICAgWzAsIDAsIDAsIDAsIDBdCiAgXQp9Cg==';

/**
 * MIME type of data/electionMinimalExhaustiveSample/precinctScannerCardTallies/pollsUnpausedAllPrecincts.json.
 */
export const mimeType = 'application/json';

/**
 * Path to a file containing this file's contents.
 *
 * SHA-256 hash of file data: f21c6ae0b223abde04843c9633f49348d1386daf66aedd958e72fa08bc9b33e3
 */
export function asFilePath(): string {
  const directoryPath = mkdtempSync(tmpdir() + sep);
  const filePath = join(directoryPath, 'pollsUnpausedAllPrecincts.json');
  writeFileSync(filePath, asBuffer());
  return filePath;
}

/**
 * Convert to a `data:` URL of data/electionMinimalExhaustiveSample/precinctScannerCardTallies/pollsUnpausedAllPrecincts.json, suitable for embedding in HTML.
 *
 * SHA-256 hash of file data: f21c6ae0b223abde04843c9633f49348d1386daf66aedd958e72fa08bc9b33e3
 */
export function asDataUrl(): string {
  return `data:${mimeType};base64,${resourceDataBase64}`;
}

/**
 * Raw data of data/electionMinimalExhaustiveSample/precinctScannerCardTallies/pollsUnpausedAllPrecincts.json.
 *
 * SHA-256 hash of file data: f21c6ae0b223abde04843c9633f49348d1386daf66aedd958e72fa08bc9b33e3
 */
export function asBuffer(): Buffer {
  return Buffer.from(resourceDataBase64, 'base64');
}

/**
 * Text content of data/electionMinimalExhaustiveSample/precinctScannerCardTallies/pollsUnpausedAllPrecincts.json.
 *
 * SHA-256 hash of file data: f21c6ae0b223abde04843c9633f49348d1386daf66aedd958e72fa08bc9b33e3
 */
export function asText(): string {
  return asBuffer().toString('utf-8');
}