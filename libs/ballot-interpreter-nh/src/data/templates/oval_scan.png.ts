/* Generated by res-to-ts. DO NOT EDIT */
/* eslint-disable */
/* istanbul ignore file */
import { createCanvas, Image, ImageData, loadImage } from 'canvas';

/**
 * Data of data/templates/oval_scan.png encoded as base64.
 */
const resourceDataBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACYAAAAZCAYAAABdEVzWAAAABmJLR0QA/wD/AP+gvaeTAAAEP0lEQVRIib2X23LbOAyGP0m0TmXrdjK56Pu/VXvXm2Zi2ZJTS5Z4wl64ZOQ4m+3O7IYzGFsUCPwAIfAny7JICOFG5nmWEIIAAsh2u03//1Q+ffokgHz8+FEAqetaAMmyTKLf8/mcfB6PxzRHnHx8fEwK0zSJUkq2260URSHA1cI/EWut7Ha7K+fzPIvWWpRS0jSNACkBp9NJQghyOBwuCdnv91cGgSswwzDcON3v9+K9f1OibgRnrU1Bj+MogOR5Lk3TiDHmKqBpmiT7jZa2banrGhEhhID3nvP5TNM0eO8BKIqC3W7H/f09/3Ysy0JVVTfzeZ4D4JzDWpt08hACWmu22y3OOfb7PcuysCwLTdMwzzNFUXA+nwG4v79nnuc/AmOtBeBwOCSH3759A+Dp6QmAEAJKKcqypKoqhmEAIHPOSdu2GGMIISSjIYQUTczcNE1UVUVRFIjIm6DGcURr/aqd9TidTmitk04I4bJGRDDG8PXrV/q+TxFGRe99irxtW47H4yWiLHtTtNb0fZ/WTtOUQB0OB0IIiAhaa06nU8rcMAzkeU4GiNaah4cHyrJEKQWAiJBlWYpsnmc2m03a1peRvxzr9c45lFIJTFEUeO8pigK4bLmI8PnzZ0IIzPNM1jSNWGsZx5GiKMjzHGMMZVm+6fi/GK/5yfP8spXn8xljTAJ1Op3eBRRAWZYYY5imCSB9aAC51hpjDHme8/j4iNb6XUB575nnmbIsadsW5xx1XeO9f66xuK91XQOw3++5u7t7F4DLspBlGWVZ4r2nqipEhFwpRd/3qc/0ff9uoN4aKWNA6urvUfyxDcVdil9ubFN5Xdd0XQeQjpr3KP6iKKjrOhW/UioVfwjhOWN93/Plyxfg0lc2m83/Du7NdhHbRAQFJFDxfIxGYhd3ziEi6RkuDTUe9nHM88z5fL466uLaaZpeBRWbct62bXoxTRO/fv0CLllrmoZhGLDWUpYlm83m+XPOsvQcHRdFwbIsCWRd1zRNg3Mu2VVKkWUZbduyLAvOuQRYa/18Bo/jKEopKcvyijOFEGTNbruukxCCPD093bwLIYhzTkII8vPnzysGPI7jFd/a7XbivRdjTNJZM+X0PAxDosBrmhtBdl0n4zim+bVOBGSMuQG6DjACjuCXZUlM1TknXdfJ3d2daK1lGAZxzj1Ta35z9LhgzT7/TpxzV4AiPf7x48fNXARqrZVxHMV7L9ZasdYmmr2m98QorLUCyIcPH9LiqDSO41WmxnEU51zKwGsSKbkx5ipTL2l8Xdey3W5TqRhj5Hg8CrFmjsdjAlfXtSilJIQgDw8PV3UWtzhK3MZo5/v37+ndsiyJ/0fHXddJVVXptrSuq3Utsi7o+D9eRmIGo5F1BqKRtTHnnJRleXPly/NclFICpG1bA3pZt8uyPNfYa2KMSQaBFGn8/SdZB9g0zd/eul6TvwDkX2VYA5KzSQAAAABJRU5ErkJggg==';

/**
 * MIME type of data/templates/oval_scan.png.
 */
export const mimeType = 'image/png';

/**
 * Convert to a `data:` URL of data/templates/oval_scan.png, suitable for embedding in HTML.
 */
export function asDataUrl() {
  return `data:${mimeType};base64,${resourceDataBase64}`;
}

/**
 * Raw data of data/templates/oval_scan.png.
 */
export function asBuffer(): Buffer {
  return Buffer.from(resourceDataBase64, 'base64');
}

/**
 * Converts data/templates/oval_scan.png to an `Image`.
 */
export async function asImage(): Promise<Image> {
  return await loadImage(asDataUrl());
}

/**
 * Converts data/templates/oval_scan.png to an `ImageData`.
 */
export async function asImageData(): Promise<ImageData> {
  const image = await asImage();
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
}