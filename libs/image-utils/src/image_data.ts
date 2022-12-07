import { err, ok, Result, safeParseInt } from '@votingworks/types';
import { assert, deferred } from '@votingworks/utils';
import { Buffer } from 'buffer';
import {
  createCanvas,
  createImageData,
  Image,
  ImageData,
  loadImage as canvasLoadImage,
} from 'canvas';
import { createWriteStream, promises as fs } from 'fs';
import { extname, parse } from 'path';
import { assertInteger } from './numeric';
import { int, usize } from './types';

/**
 * Error kinds that can occur during image processing.
 */
export enum ImageProcessingErrorKind {
  UnsupportedChannelCount = 'UnsupportedChannelCount',
  UnsupportedImageFormat = 'UnsupportedImageFormat',
  WriteError = 'WriteError',
}

/**
 * Error that occurs when an image has an unexpected number of channels.
 */
export interface UnsupportedChannelCountError {
  readonly kind: ImageProcessingErrorKind.UnsupportedChannelCount;
  readonly channelCount: int;
}

/**
 * Error that occurs when an image has an unsupported format.
 */
export interface UnsupportedImageFormatError {
  readonly kind: ImageProcessingErrorKind.UnsupportedImageFormat;
  readonly format: string;
}

/**
 * Error that occurs when writing an image to disk.
 */
export interface WriteError {
  readonly kind: ImageProcessingErrorKind.WriteError;
  readonly error: Error;
}

/**
 * Errors that can occur during image processing.
 */
export type ImageProcessingError =
  | UnsupportedChannelCountError
  | UnsupportedImageFormatError
  | WriteError;

/**
 * The number of channels a grayscale image has (1).
 */
export const GRAY_CHANNEL_COUNT = 1;

/**
 * The number of channels an RGB color image has (3).
 */
export const RGB_CHANNEL_COUNT = 3;

/**
 * The number of channels an RGBA color image has (4).
 */
export const RGBA_CHANNEL_COUNT = 4;

/**
 * Ensures the image data is an instance of ImageData.
 */
export function ensureImageData(imageData: ImageData): ImageData {
  if (imageData instanceof ImageData) {
    return imageData;
  }

  const { data, width, height } = imageData as ImageData;
  return createImageData(data, width, height);
}

/**
 * Determines the number of channels in an image.
 */
export function getImageChannelCount(image: ImageData): int {
  return assertInteger(image.data.length / image.width / image.height);
}

/**
 * Determines whether the image is RGBA.
 */
export function isRgba(image: ImageData): boolean {
  return getImageChannelCount(image) === RGBA_CHANNEL_COUNT;
}

/**
 * Determines whether the image is RGBA.
 */
export function isGrayscale(image: ImageData): boolean {
  return getImageChannelCount(image) === GRAY_CHANNEL_COUNT;
}

/**
 * Loads a RAW image from a file.
 */
async function loadRawImage(
  path: string,
  width: number,
  height: number,
  channelCount: number
): Promise<ImageData> {
  assert(
    channelCount === GRAY_CHANNEL_COUNT ||
      channelCount === RGB_CHANNEL_COUNT ||
      channelCount === RGBA_CHANNEL_COUNT
  );

  const imageData = createImageData(width, height);
  const buffer = await fs.readFile(path);

  for (
    let srcOffset = 0, dstOffset = 0;
    srcOffset < buffer.length;
    srcOffset += channelCount, dstOffset += RGBA_CHANNEL_COUNT
  ) {
    imageData.data[dstOffset] = buffer[srcOffset] as number;
    imageData.data[dstOffset + 1] = buffer[
      channelCount > GRAY_CHANNEL_COUNT ? srcOffset + 1 : srcOffset
    ] as number;
    imageData.data[dstOffset + 2] = buffer[
      channelCount > GRAY_CHANNEL_COUNT ? srcOffset + 2 : srcOffset
    ] as number;
    imageData.data[dstOffset + 3] = buffer[
      channelCount > RGB_CHANNEL_COUNT ? srcOffset + 3 : srcOffset
    ] as number;
  }

  return imageData;
}

/**
 * Loads a RAW image from a file. The file name must be in the format
 * `{label}-{width}x{height}-{bitsPerPixel}bpp.raw`. For example:
 * `ballot-1700x2200-24bpp.raw` or `scan-1700x2200-8bpp.raw`.
 */
async function loadRawImageWithMetadataInFileName(
  path: string
): Promise<ImageData> {
  const parts = parse(path);
  const match = parts.name.match(/(\d+)x(\d+)-(\d+)bpp/);
  if (!match) {
    throw new Error(`Invalid raw image filename: ${parts.name}`);
  }
  const [, widthResult, heightResult, bitsPerPixelResult] = match.map((n) =>
    safeParseInt(n, { min: 1 })
  ) as [
    Result<number, Error>,
    Result<number, Error>,
    Result<number, Error>,
    Result<number, Error>
  ];

  // these should be valid because of the regex above
  const width = widthResult.assertOk('width is valid');
  const height = heightResult.assertOk('height is valid');
  const bitsPerPixel = bitsPerPixelResult.assertOk('bitsPerPixel is valid');
  const srcBytesPerPixel = Math.round(bitsPerPixel / 8);
  return await loadRawImage(path, width, height, srcBytesPerPixel);
}

/**
 * Loads an image from a file path.
 */
export async function loadImage(path: string): Promise<Image> {
  const parts = parse(path);
  if (parts.ext === '.raw') {
    const imageData = await loadRawImageWithMetadataInFileName(path);
    const image = new Image();
    const canvas = createCanvas(imageData.width, imageData.height);
    const context = canvas.getContext('2d');
    context.putImageData(imageData, 0, 0);
    image.src = canvas.toDataURL();
    return image;
  }

  return await canvasLoadImage(path);
}

/**
 * Loads an image from a file path.
 */
export async function loadImageData(path: string): Promise<ImageData>;
/**
 * Loads an image from a buffer.
 */
export async function loadImageData(data: Buffer): Promise<ImageData>;
/**
 * Loads an image from a file path or buffer.
 */
export async function loadImageData(
  pathOrData: string | Buffer
): Promise<ImageData> {
  if (typeof pathOrData === 'string') {
    const parts = parse(pathOrData);
    if (parts.ext === '.raw') {
      return loadRawImageWithMetadataInFileName(pathOrData);
    }
  }

  const img = await canvasLoadImage(pathOrData);
  const canvas = createCanvas(img.width, img.height);
  const context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  return context.getImageData(0, 0, img.width, img.height);
}

/**
 * Creates a PNG image stream from image data.
 */
export function createPngStream(image: ImageData): NodeJS.ReadableStream {
  const { width, height } = image;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  context.putImageData(image, 0, 0);
  return canvas.createPNGStream();
}

/**
 * Creates a JPEG image stream from image data.
 */
export function createJpegStream(image: ImageData): NodeJS.ReadableStream {
  const { width, height } = image;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  context.putImageData(image, 0, 0);
  return canvas.createJPEGStream();
}

/**
 * Creates a data URL from image data.
 */
export function toDataUrl(
  image: ImageData,
  mimeType: 'image/png' | 'image/jpeg'
): string {
  const { width, height } = image;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  context.putImageData(image, 0, 0);
  return mimeType === 'image/jpeg'
    ? canvas.toDataURL(mimeType)
    : canvas.toDataURL(mimeType);
}

/**
 * Extracts image data from an image.
 */
export function toImageData(
  image: Image,
  {
    maxWidth = image.width,
    maxHeight = image.height,
  }: {
    maxWidth?: usize;
    maxHeight?: usize;
  } = {}
): ImageData {
  const xScale = maxWidth / image.width;
  const yScale = maxHeight / image.height;
  const scale = Math.min(xScale, yScale);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  context.drawImage(image, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}

/**
 * Converts an image to an RGBA image.
 */
export function toRgba(
  imageData: ImageData
): Result<ImageData, ImageProcessingError> {
  if (isRgba(imageData)) {
    return ok(ensureImageData(imageData));
  }

  if (isGrayscale(imageData)) {
    const data = new Uint8ClampedArray(imageData.data.length * 4);
    for (
      let sourceIndex = 0, destIndex = 0;
      sourceIndex < imageData.data.length;
      sourceIndex += 1, destIndex += 4
    ) {
      const lum = imageData.data[sourceIndex] as number;
      data[destIndex] = lum;
      data[destIndex + 1] = lum;
      data[destIndex + 2] = lum;
      data[destIndex + 3] = 255;
    }
    return ok(createImageData(data, imageData.width, imageData.height));
  }

  return err({
    kind: ImageProcessingErrorKind.UnsupportedChannelCount,
    channelCount: getImageChannelCount(imageData),
  });
}

/**
 * Converts an image to grayscale.
 */
export function toGrayscale(
  imageData: ImageData
): Result<ImageData, ImageProcessingError> {
  if (isGrayscale(imageData)) {
    return ok(imageData);
  }

  if (!isRgba(imageData)) {
    return err({
      kind: ImageProcessingErrorKind.UnsupportedChannelCount,
      channelCount: getImageChannelCount(imageData),
    });
  }

  const dst = new Uint8ClampedArray(imageData.width * imageData.height);
  const output = createImageData(dst, imageData.width, imageData.height);
  const input32 = new Int32Array(imageData.data.buffer);

  for (let offset = 0, size = input32.length; offset < size; offset += 1) {
    const px = input32[offset] as number;
    const r = px & 0xff;
    const g = (px >>> 8) & 0xff;
    const b = (px >>> 16) & 0xff;

    // Luminosity grayscale formula.
    const luminosity = (0.21 * r + 0.72 * g + 0.07 * b) | 0;
    dst[offset] = luminosity;
  }

  return ok(output);
}

/**
 * Writes an image to a file.
 */
export async function writeImageData(
  path: string,
  image: ImageData
): Promise<Result<void, ImageProcessingError>> {
  const { promise, resolve } = deferred<Result<void, ImageProcessingError>>();

  if (path.endsWith('.png')) {
    const toRgbaResult = toRgba(image);
    /* istanbul ignore next */
    if (toRgbaResult.isErr()) {
      return toRgbaResult;
    }
    createPngStream(toRgbaResult.ok())
      .pipe(createWriteStream(path))
      .on('finish', () => resolve(ok()))
      .on('error', (error) =>
        resolve(
          err({
            kind: ImageProcessingErrorKind.WriteError,
            error,
          })
        )
      );
  } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
    const toRgbaResult = toRgba(image);
    /* istanbul ignore next */
    if (toRgbaResult.isErr()) {
      return toRgbaResult;
    }
    createJpegStream(toRgbaResult.ok())
      .pipe(createWriteStream(path))
      .on('finish', () => resolve(ok()))
      .on('error', (error) =>
        resolve(
          err({
            kind: ImageProcessingErrorKind.WriteError,
            error,
          })
        )
      );
  } else {
    resolve(
      err({
        kind: ImageProcessingErrorKind.UnsupportedImageFormat,
        format: extname(path),
      })
    );
  }

  return promise;
}
