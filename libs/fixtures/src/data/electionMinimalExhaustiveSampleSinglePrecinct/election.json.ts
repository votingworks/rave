/* Generated by res-to-ts. DO NOT EDIT */
/* eslint-disable */
/* istanbul ignore file */

import { Buffer } from 'buffer';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';
import { safeParseElectionDefinition } from '@votingworks/types';

/**
 * Data of data/electionMinimalExhaustiveSampleSinglePrecinct/election.json encoded as base64.
 *
 * SHA-256 hash of file data: 09853d5e61fba50243cb50c15739f234430f4023f145da4ae3e8a04a88a9988b
 */
const resourceDataBase64 = 'ewogICJ0aXRsZSI6ICJFeGFtcGxlIFByaW1hcnkgRWxlY3Rpb24iLAogICJzdGF0ZSI6ICJTdGF0ZSBvZiBTYW1wbGUiLAogICJjb3VudHkiOiB7CiAgICAiaWQiOiAic2FtcGxlLWNvdW50eSIsCiAgICAibmFtZSI6ICJTYW1wbGUgQ291bnR5IgogIH0sCiAgImRhdGUiOiAiMjAyMS0wOS0wOFQwMDowMDowMC0wODowMCIsCiAgImJhbGxvdExheW91dCI6IHsKICAgICJwYXBlclNpemUiOiAibGV0dGVyIgogIH0sCiAgImRpc3RyaWN0cyI6IFsKICAgIHsKICAgICAgImlkIjogImRpc3RyaWN0LTEiLAogICAgICAibmFtZSI6ICJEaXN0cmljdCAxIgogICAgfQogIF0sCiAgInBhcnRpZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICIwIiwKICAgICAgIm5hbWUiOiAiTWFtbWFsIiwKICAgICAgImZ1bGxOYW1lIjogIk1hbW1hbCBQYXJ0eSIsCiAgICAgICJhYmJyZXYiOiAiTWEiCiAgICB9LAogICAgewogICAgICAiaWQiOiAiMSIsCiAgICAgICJuYW1lIjogIkZpc2giLAogICAgICAiZnVsbE5hbWUiOiAiRmlzaCBQYXJ0eSIsCiAgICAgICJhYmJyZXYiOiAiRiIKICAgIH0KICBdLAogICJjb250ZXN0cyI6IFsKICAgIHsKICAgICAgImlkIjogImJlc3QtYW5pbWFsLW1hbW1hbCIsCiAgICAgICJkaXN0cmljdElkIjogImRpc3RyaWN0LTEiLAogICAgICAidHlwZSI6ICJjYW5kaWRhdGUiLAogICAgICAidGl0bGUiOiAiQmVzdCBBbmltYWwiLAogICAgICAic2VhdHMiOiAxLAogICAgICAicGFydHlJZCI6ICIwIiwKICAgICAgImNhbmRpZGF0ZXMiOiBbCiAgICAgICAgewogICAgICAgICAgImlkIjogImhvcnNlIiwKICAgICAgICAgICJuYW1lIjogIkhvcnNlIiwKICAgICAgICAgICJwYXJ0eUlkcyI6IFsiMCJdCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAib3R0ZXIiLAogICAgICAgICAgIm5hbWUiOiAiT3R0ZXIiLAogICAgICAgICAgInBhcnR5SWRzIjogWyIwIl0KICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICJpZCI6ICJmb3giLAogICAgICAgICAgIm5hbWUiOiAiRm94IiwKICAgICAgICAgICJwYXJ0eUlkcyI6IFsiMCJdCiAgICAgICAgfQogICAgICBdLAogICAgICAiYWxsb3dXcml0ZUlucyI6IGZhbHNlCiAgICB9LAogICAgewogICAgICAiaWQiOiAiYmVzdC1hbmltYWwtZmlzaCIsCiAgICAgICJkaXN0cmljdElkIjogImRpc3RyaWN0LTEiLAogICAgICAidHlwZSI6ICJjYW5kaWRhdGUiLAogICAgICAidGl0bGUiOiAiQmVzdCBBbmltYWwiLAogICAgICAic2VhdHMiOiAxLAogICAgICAicGFydHlJZCI6ICIxIiwKICAgICAgImNhbmRpZGF0ZXMiOiBbCiAgICAgICAgewogICAgICAgICAgImlkIjogInNlYWhvcnNlIiwKICAgICAgICAgICJuYW1lIjogIlNlYWhvcnNlIiwKICAgICAgICAgICJwYXJ0eUlkcyI6IFsiMSJdCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAic2FsbW9uIiwKICAgICAgICAgICJuYW1lIjogIlNhbG1vbiIsCiAgICAgICAgICAicGFydHlJZHMiOiBbIjEiXQogICAgICAgIH0KICAgICAgXSwKICAgICAgImFsbG93V3JpdGVJbnMiOiBmYWxzZQogICAgfSwKICAgIHsKICAgICAgImlkIjogInpvby1jb3VuY2lsLW1hbW1hbCIsCiAgICAgICJkaXN0cmljdElkIjogImRpc3RyaWN0LTEiLAogICAgICAidHlwZSI6ICJjYW5kaWRhdGUiLAogICAgICAidGl0bGUiOiAiWm9vIENvdW5jaWwiLAogICAgICAic2VhdHMiOiAzLAogICAgICAicGFydHlJZCI6ICIwIiwKICAgICAgImNhbmRpZGF0ZXMiOiBbCiAgICAgICAgewogICAgICAgICAgImlkIjogInplYnJhIiwKICAgICAgICAgICJuYW1lIjogIlplYnJhIiwKICAgICAgICAgICJwYXJ0eUlkcyI6IFsiMCJdCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAibGlvbiIsCiAgICAgICAgICAibmFtZSI6ICJMaW9uIiwKICAgICAgICAgICJwYXJ0eUlkcyI6IFsiMCJdCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAia2FuZ2Fyb28iLAogICAgICAgICAgIm5hbWUiOiAiS2FuZ2Fyb28iLAogICAgICAgICAgInBhcnR5SWRzIjogWyIwIl0KICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICJpZCI6ICJlbGVwaGFudCIsCiAgICAgICAgICAibmFtZSI6ICJFbGVwaGFudCIsCiAgICAgICAgICAicGFydHlJZHMiOiBbIjAiXQogICAgICAgIH0KICAgICAgXSwKICAgICAgImFsbG93V3JpdGVJbnMiOiB0cnVlCiAgICB9LAogICAgewogICAgICAiaWQiOiAiYXF1YXJpdW0tY291bmNpbC1maXNoIiwKICAgICAgImRpc3RyaWN0SWQiOiAiZGlzdHJpY3QtMSIsCiAgICAgICJ0eXBlIjogImNhbmRpZGF0ZSIsCiAgICAgICJ0aXRsZSI6ICJab28gQ291bmNpbCIsCiAgICAgICJzZWF0cyI6IDIsCiAgICAgICJwYXJ0eUlkIjogIjEiLAogICAgICAiY2FuZGlkYXRlcyI6IFsKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAibWFudGEtcmF5IiwKICAgICAgICAgICJuYW1lIjogIk1hbnRhIFJheSIsCiAgICAgICAgICAicGFydHlJZHMiOiBbIjEiXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgImlkIjogInB1ZmZlcmZpc2giLAogICAgICAgICAgIm5hbWUiOiAiUHVmZmVyZmlzaCIsCiAgICAgICAgICAicGFydHlJZHMiOiBbIjEiXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgImlkIjogInJvY2tmaXNoIiwKICAgICAgICAgICJuYW1lIjogIlJvY2tmaXNoIiwKICAgICAgICAgICJwYXJ0eUlkcyI6IFsiMSJdCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAidHJpZ2dlcmZpc2giLAogICAgICAgICAgIm5hbWUiOiAiVHJpZ2dlcmZpc2giLAogICAgICAgICAgInBhcnR5SWRzIjogWyIxIl0KICAgICAgICB9CiAgICAgIF0sCiAgICAgICJhbGxvd1dyaXRlSW5zIjogdHJ1ZQogICAgfSwKICAgIHsKICAgICAgImlkIjogIm5ldy16b28tZWl0aGVyIiwKICAgICAgImRpc3RyaWN0SWQiOiAiZGlzdHJpY3QtMSIsCiAgICAgICJ0eXBlIjogInllc25vIiwKICAgICAgInRpdGxlIjogIkJhbGxvdCBNZWFzdXJlIDEiLAogICAgICAiZGVzY3JpcHRpb24iOiAiSW5pdGlhdGl2ZSBNZWFzdXJlIE5vLiAxMiwgU2hvdWxkIFNhbXBsZSBDaXR5IGVzdGFibGlzaCBhIG5ldyBzYWZhcmktc3R5bGUgem9vIGNvc3RpbmcgMiwwMDAsMDAwP1xuXG4gQWx0ZXJuYXRpdmUgTWVhc3VyZSAxMiBBLCBTaG91bGQgU2FtcGxlIENpdHkgZXN0YWJsaXNoIGEgbmV3IHRyYWRpdGlvbmFsIHpvbyBjb3N0aW5nIDEsMDAwLDAwMD8iLAogICAgICAieWVzT3B0aW9uIjogewogICAgICAgICJpZCI6ICJuZXctem9vLWVpdGhlci1hcHByb3ZlZCIsCiAgICAgICAgImxhYmVsIjogIkZPUiBBUFBST1ZBTCBPRiBFSVRIRVIgSW5pdGlhdGl2ZSBOby4gMTIgT1IgQWx0ZXJuYXRpdmUgSW5pdGlhdGl2ZSBOby4gMTIgQSIKICAgICAgfSwKICAgICAgIm5vT3B0aW9uIjogewogICAgICAgICJpZCI6ICJuZXctem9vLW5laXRoZXItYXBwcm92ZWQiLAogICAgICAgICJsYWJlbCI6ICJBR0FJTlNUIEJPVEggSW5pdGlhdGl2ZSBOby4gMTIgQU5EIEFsdGVybmF0aXZlIE1lYXN1cmUgMTIgQSIKICAgICAgfQogICAgfSwKICAgIHsKICAgICAgImlkIjogIm5ldy16b28tcGljayIsCiAgICAgICJkaXN0cmljdElkIjogImRpc3RyaWN0LTEiLAogICAgICAidHlwZSI6ICJ5ZXNubyIsCiAgICAgICJ0aXRsZSI6ICJCYWxsb3QgTWVhc3VyZSAxIiwKICAgICAgImRlc2NyaXB0aW9uIjogIkluaXRpYXRpdmUgTWVhc3VyZSBOby4gMTIsIFNob3VsZCBTYW1wbGUgQ2l0eSBlc3RhYmxpc2ggYSBuZXcgc2FmYXJpLXN0eWxlIHpvbyBjb3N0aW5nIDIsMDAwLDAwMD9cblxuIEFsdGVybmF0aXZlIE1lYXN1cmUgMTIgQSwgU2hvdWxkIFNhbXBsZSBDaXR5IGVzdGFibGlzaCBhIG5ldyB0cmFkaXRpb25hbCB6b28gY29zdGluZyAxLDAwMCwwMDA/IiwKICAgICAgInllc09wdGlvbiI6IHsKICAgICAgICAiaWQiOiAibmV3LXpvby1zYWZhcmkiLAogICAgICAgICJsYWJlbCI6ICJGT1IgSW5pdGlhdGl2ZSBOby4gMTIiCiAgICAgIH0sCiAgICAgICJub09wdGlvbiI6IHsKICAgICAgICAiaWQiOiAibmV3LXpvby10cmFkaXRpb25hbCIsCiAgICAgICAgImxhYmVsIjogIkZPUiBBbHRlcm5hdGl2ZSBNZWFzdXJlIE5vLiAxMiBBIgogICAgICB9CiAgICB9LAogICAgewogICAgICAiaWQiOiAiZmlzaGluZyIsCiAgICAgICJkaXN0cmljdElkIjogImRpc3RyaWN0LTEiLAogICAgICAidHlwZSI6ICJ5ZXNubyIsCiAgICAgICJ0aXRsZSI6ICJCYWxsb3QgTWVhc3VyZSAzIiwKICAgICAgImRlc2NyaXB0aW9uIjogIlNob3VsZCBmaXNoaW5nIGJlIGJhbm5lZCBpbiBhbGwgY2l0eSBvd25lZCBsYWtlcyBhbmQgcml2ZXJzPyIsCiAgICAgICJ5ZXNPcHRpb24iOiB7CiAgICAgICAgImlkIjogImJhbi1maXNoaW5nIiwKICAgICAgICAibGFiZWwiOiAiWUVTIgogICAgICB9LAogICAgICAibm9PcHRpb24iOiB7CiAgICAgICAgImlkIjogImFsbG93LWZpc2hpbmciLAogICAgICAgICJsYWJlbCI6ICJOTyIKICAgICAgfQogICAgfQogIF0sCiAgInByZWNpbmN0cyI6IFsKICAgIHsKICAgICAgImlkIjogInByZWNpbmN0LTEiLAogICAgICAibmFtZSI6ICJQcmVjaW5jdCAxIgogICAgfQogIF0sCiAgImJhbGxvdFN0eWxlcyI6IFsKICAgIHsKICAgICAgImlkIjogIjFNIiwKICAgICAgInByZWNpbmN0cyI6IFsicHJlY2luY3QtMSJdLAogICAgICAiZGlzdHJpY3RzIjogWyJkaXN0cmljdC0xIl0sCiAgICAgICJwYXJ0eUlkIjogIjAiCiAgICB9LAogICAgewogICAgICAiaWQiOiAiMkYiLAogICAgICAicHJlY2luY3RzIjogWyJwcmVjaW5jdC0xIl0sCiAgICAgICJkaXN0cmljdHMiOiBbImRpc3RyaWN0LTEiXSwKICAgICAgInBhcnR5SWQiOiAiMSIKICAgIH0KICBdLAogICJzZWFsVXJsIjogIi9zZWFscy9TYW1wbGUtU2VhbC5zdmciCn0K';

/**
 * MIME type of data/electionMinimalExhaustiveSampleSinglePrecinct/election.json.
 */
export const mimeType = 'application/json';

/**
 * Path to a file containing this file's contents.
 *
 * SHA-256 hash of file data: 09853d5e61fba50243cb50c15739f234430f4023f145da4ae3e8a04a88a9988b
 */
export function asFilePath(): string {
  const directoryPath = mkdtempSync(tmpdir() + sep);
  const filePath = join(directoryPath, 'election.json');
  writeFileSync(filePath, asBuffer());
  return filePath;
}

/**
 * Convert to a `data:` URL of data/electionMinimalExhaustiveSampleSinglePrecinct/election.json, suitable for embedding in HTML.
 *
 * SHA-256 hash of file data: 09853d5e61fba50243cb50c15739f234430f4023f145da4ae3e8a04a88a9988b
 */
export function asDataUrl(): string {
  return `data:${mimeType};base64,${resourceDataBase64}`;
}

/**
 * Raw data of data/electionMinimalExhaustiveSampleSinglePrecinct/election.json.
 *
 * SHA-256 hash of file data: 09853d5e61fba50243cb50c15739f234430f4023f145da4ae3e8a04a88a9988b
 */
export function asBuffer(): Buffer {
  return Buffer.from(resourceDataBase64, 'base64');
}

/**
 * Text content of data/electionMinimalExhaustiveSampleSinglePrecinct/election.json.
 *
 * SHA-256 hash of file data: 09853d5e61fba50243cb50c15739f234430f4023f145da4ae3e8a04a88a9988b
 */
export function asText(): string {
  return asBuffer().toString('utf-8');
}

/**
 * Full election definition for data/electionMinimalExhaustiveSampleSinglePrecinct/election.json.
 *
 * SHA-256 hash of file data: 09853d5e61fba50243cb50c15739f234430f4023f145da4ae3e8a04a88a9988b
 */
export const electionDefinition = safeParseElectionDefinition(
  asText()
).unsafeUnwrap();

/**
 * Election definition for data/electionMinimalExhaustiveSampleSinglePrecinct/election.json.
 *
 * SHA-256 hash of file data: 09853d5e61fba50243cb50c15739f234430f4023f145da4ae3e8a04a88a9988b
 */
export const election = electionDefinition.election;