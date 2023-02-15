import { err, ok } from '@votingworks/basics';
import { Buffer } from 'buffer';
import * as fc from 'fast-check';
import { BaseCoder } from './base_coder';
import { bufferContainsBitOffset, toByteOffset } from './bits';
import { DecodeResult, EncodeResult, Uint8 } from './types';

class TestCoder extends BaseCoder<number> {
  default(): number {
    return 0;
  }

  bitLength(): number {
    return 8;
  }

  encodeInto(value: number, buffer: Buffer, bitOffset: number): EncodeResult {
    if (!bufferContainsBitOffset(buffer, bitOffset, 8)) {
      return err('SmallBuffer');
    }

    const byteOffset = toByteOffset(bitOffset).unsafeUnwrap();
    buffer.writeUInt8(value, byteOffset);
    return ok(bitOffset + 8);
  }

  decodeFrom(buffer: Buffer, bitOffset: number): DecodeResult<number> {
    if (!bufferContainsBitOffset(buffer, bitOffset, 8)) {
      return err('SmallBuffer');
    }

    const byteOffset = toByteOffset(bitOffset).unsafeUnwrap();
    return ok({ value: buffer[byteOffset] as Uint8, bitOffset: bitOffset + 8 });
  }
}

test('encode default implementation', () => {
  const coder = new TestCoder();
  expect(coder.encode(1)).toEqual(ok(Buffer.from([1])));

  fc.assert(
    fc.property(fc.integer(0, 0xff), (value) => {
      expect(coder.encode(value)).toEqual(ok(Buffer.from([value])));
    })
  );
});

test('decode default implementation', () => {
  const coder = new TestCoder();

  fc.assert(
    fc.property(fc.integer(0, 0xff), (value) => {
      expect(coder.decode(Buffer.from([value]))).toEqual(ok(value));
    })
  );
});
