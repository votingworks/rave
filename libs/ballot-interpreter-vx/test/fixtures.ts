import { loadImageData, rotate180 } from '@votingworks/image-utils';
import {
  BallotPageMetadata,
  BallotPageMetadataSchema,
  safeParseJson,
} from '@votingworks/types';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Input } from '../src';
import { adjacentFile } from '../src/utils/path';

export function adjacentMetadataFile(imagePath: string): string {
  return adjacentFile('-metadata', imagePath, '.json');
}

export class Fixture implements Input {
  constructor(private readonly basePath: string) {}

  id(): string {
    return this.filePath();
  }

  filePath(): string {
    return this.basePath;
  }

  async imageData({ flipped = false } = {}): Promise<ImageData> {
    const imageData = await loadImageData(this.filePath());
    if (flipped) {
      rotate180(imageData);
    }
    return imageData;
  }

  metadataPath(): string {
    return adjacentMetadataFile(this.filePath());
  }

  async metadata(
    overrides: Partial<BallotPageMetadata> = {}
  ): Promise<BallotPageMetadata> {
    return {
      ...safeParseJson(
        await fs.readFile(this.metadataPath(), 'utf-8'),
        BallotPageMetadataSchema
      ).unsafeUnwrap(),
      ...overrides,
    };
  }
}

/**
 * A QR code that is not readable due to it being cropped.
 */
export const croppedQrCode = new Fixture(
  join(__dirname, 'fixtures/cropped-qr-code.jpg')
);
