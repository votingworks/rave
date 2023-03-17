/* Generated by res-to-ts. DO NOT EDIT */
/* eslint-disable */
/* istanbul ignore file */

import { Buffer } from 'buffer';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';

/**
 * Data of data/AdminInitialSetupPackage.zip encoded as base64.
 *
 * SHA-256 hash of file data: 64f5c96a1c04b1451c9656a2ff0f678f3312c3d4822894b75a54353e05fb77e6
 */
const resourceDataBase64 = 'UEsDBBQACAAIAI5UZlYAAAAAAAAAAIQTAAANACAAZWxlY3Rpb24uanNvblVUDQAHrDIGZKf5C2Sy+QtkdXgLAAEE6QMAAATpAwAA7VjLctMwFN3nKzRex2CHDbBhUkhohjbJJAGGRxeyoySaypKR5BaX6b8jy46fsgkuhQ0zbcbxub7nPo6uFf0YAGBJLAmyXgJr8h0GIUFgyXEAeQwmBPkSM2oNEzMhodRm6+QCsB1Ya/MU9VlEZazgH+qb+o63ianQFnYGDlOIwiD1k7K9TkGF3WtP24xm5Ixc23lhO883jvNS/6lr9ZkSepAQJi9gzCJZ0IYwRHyN77QHgqREvOQZC8mxL4UCv2j79Kk83KOB7WaxlqJ9k2HAtTR0rz6vtNsQcolRq1On6esSBgEkxf1dRMi8goGlchoXFtDzOLpJ8Yx/aCIzBD7F4mCmSpB2omk9T59RiUR79TwF2pAq7RA7qGV4rOystc4yDnVQPqRbrDVQQEeBnikGMNYMBSoQ1DG5+Z2kIfGsXvzccZFAOYlSIgfGRUFfKeZ5E8rYtFfFd5Vj98MuEqa1aSRZNKGeJDv23UwxrQPtBNnVVSERtfBuP3Is0Ywm9jtIBOrQZFkXu4oY/5Uq3D6qUB47hLE2opWquie3TUASZGO3SWTA2mke3Lw7xvT49vFjLerPjOl3gGJotu/ZH1vUd8jj0FzSz02o53ojuK1tFw2kJ8U1pHvIGTPTvDOiPakQQeEBUmmmmhjRB8wRyaMuJcJvEeQ4CnI5PsYs6RTj6I/NkkDVDdocxubSXiYwWNXhntMkjHY7xCvVqrAtW/CedJz51+1kKyPak0q1eL/vSm3TZvCAifkLmVJ0aydDE2F5KL3Ff0OfMRKUGbR5pne84BJBEXEESk9ukfA5DvVeXRnOKJYYSnyDcuM5ewLc0RCsDywiW3DcemMZA/X2hB5JtoIQqOCBgDu1zmwhY2WhMgE+ExLTvZK/4zjJ/6uv9CsFY6J2KbRK447A+CQSyeEWJ/GqrW6Zw805iuxUPRbH3AoRGMttwzDk7AZtS922CPQQ0ZuexQqMl8vV4sP4AiymYDLbnE9WoFSutEwgsStl1zQYW4OaPi3Kfh0kPSXK8dvxbL7egLPF5txEPX/TWvo8qhP0GWL/+r86/5I606hbRdnocj95lcJu17+hLg1Rd8gnGaWqFI+onGetysk6l4UAPAQ8SCnaAkyB8gH8pJfsNrlD4DUSQL2PAVeZcnFqw5RDu55iuYSfJuvf641+e3S6nC9qdR/kBwsc+Zh2nFccDUznFcsMy88rjO3MPYw6PIzqJwHp2cs6WYOtsbmXhcdKIpWoKxFcNUSVPlASVWFS+T3QkeFo+tfiaJwMqY0jec91l58m1+JpOnVs9WuRPBE3e2twP/gJUEsHCILZSZbVAwAAhBMAAFBLAwQUAAgACAAms2hWAAAAAAAAAAAoAAAAEwAgAHN5c3RlbVNldHRpbmdzLmpzb25VVA0AB8l7CWTmkQtk/HsJZHV4CwABBOkDAAAE6QMAAKvmUlBQKsjPyQnPL8pOLXJOLEoJyMwrds1LTMpJTVGyUigpKk3lquUCAFBLBwhkv2K9KgAAACgAAABQSwECFAMUAAgACACOVGZWgtlJltUDAACEEwAADQAgAAAAAAAAAAAApIEAAAAAZWxlY3Rpb24uanNvblVUDQAHrDIGZKf5C2Sy+QtkdXgLAAEE6QMAAATpAwAAUEsBAhQDFAAIAAgAJrNoVmS/Yr0qAAAAKAAAABMAIAAAAAAAAAAAAKSBMAQAAHN5c3RlbVNldHRpbmdzLmpzb25VVA0AB8l7CWTmkQtk/HsJZHV4CwABBOkDAAAE6QMAAFBLBQYAAAAAAgACALwAAAC7BAAAAAA=';

/**
 * MIME type of data/AdminInitialSetupPackage.zip.
 */
export const mimeType = 'application/zip';

/**
 * Path to a file containing this file's contents.
 *
 * SHA-256 hash of file data: 64f5c96a1c04b1451c9656a2ff0f678f3312c3d4822894b75a54353e05fb77e6
 */
export function asFilePath(): string {
  const directoryPath = mkdtempSync(tmpdir() + sep);
  const filePath = join(directoryPath, 'AdminInitialSetupPackage.zip');
  writeFileSync(filePath, asBuffer());
  return filePath;
}

/**
 * Convert to a `data:` URL of data/AdminInitialSetupPackage.zip, suitable for embedding in HTML.
 *
 * SHA-256 hash of file data: 64f5c96a1c04b1451c9656a2ff0f678f3312c3d4822894b75a54353e05fb77e6
 */
export function asDataUrl(): string {
  return `data:${mimeType};base64,${resourceDataBase64}`;
}

/**
 * Raw data of data/AdminInitialSetupPackage.zip.
 *
 * SHA-256 hash of file data: 64f5c96a1c04b1451c9656a2ff0f678f3312c3d4822894b75a54353e05fb77e6
 */
export function asBuffer(): Buffer {
  return Buffer.from(resourceDataBase64, 'base64');
}