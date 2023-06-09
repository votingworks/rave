/* eslint-disable max-classes-per-file */
import { Buffer } from 'buffer';
import { assert } from '@votingworks/basics';
import { asHexString, Byte, isByte } from '@votingworks/types';

/**
 * The max length of an APDU
 */
export const MAX_APDU_LENGTH = 260;

/**
 * The max length of a command APDU's data. The `- 5` accounts for the CLA, INS, P1, P2, and Lc
 * (see CommandApdu below).
 */
export const MAX_COMMAND_APDU_DATA_LENGTH = MAX_APDU_LENGTH - 5;

/**
 * The max length of a response APDU's data. The `- 2` accounts for the status word (see
 * STATUS_WORD below).
 */
export const MAX_RESPONSE_APDU_DATA_LENGTH = MAX_APDU_LENGTH - 2;

/**
 * Because APDUs have a max length, commands involving larger amounts of data have to be sent as
 * multiple, chained APDUs. The APDU CLA indicates whether more data has yet to be provided.
 *
 * The CLA also indicates whether the APDU is being sent over a GlobalPlatform Secure Channel,
 * typically used for initial card configuration.
 */
const CLA = {
  STANDARD: 0x00,
  CHAINED: 0x10,
  SECURE: 0x0c,
  SECURE_CHAINED: 0x1c,
} as const;

/**
 * APDU status words are analogous to HTTP status codes. Every response APDU ends with one, each
 * consisting of two bytes, commonly referred to as SW1 and SW2.
 *
 * - 0x90 0x00 is equivalent to an HTTP 200.
 * - 0x61 0xXX is also equivalent to an HTTP 200 but indicates that XX more bytes of response data
 *   have yet to be retrieved via a GET RESPONSE command. Like command APDUs, response APDUs have a
 *   max length.
 *
 * See https://www.eftlab.com/knowledge-base/complete-list-of-apdu-responses for a list of all
 * known status words.
 */
export const STATUS_WORD = {
  SUCCESS: { SW1: 0x90, SW2: 0x00 },
  SUCCESS_MORE_DATA_AVAILABLE: { SW1: 0x61 },
  FILE_NOT_FOUND: { SW1: 0x6a, SW2: 0x82 },
  VERIFY_FAIL: { SW1: 0x63 },
} as const;

/**
 * The SELECT command is a standard command for selecting an applet.
 */
export const SELECT = {
  INS: 0xa4,
  P1: 0x04,
  P2: 0x00,
} as const;

/**
 * The GET RESPONSE command is a standard command for retrieving additional APDU response data.
 */
export const GET_RESPONSE = {
  INS: 0xc0,
  P1: 0x00,
  P2: 0x00,
} as const;

function splitEvery2Characters(s: string): string[] {
  assert(s.length > 0 && s.length % 2 === 0);
  const sSplit = s.match(/.{2}/g);
  assert(sSplit !== null);
  return sSplit;
}

/**
 * An APDU, or application protocol data unit, is the communication unit between a smart card
 * reader and a smart card. The smart card reader issues command APDUs to the smart card, and the
 * smart card sends response APDUs back.
 *
 * See https://docs.yubico.com/yesdk/users-manual/yubikey-reference/apdu.html for a great overview.
 */
export class CommandApdu {
  /** CLA: Class */
  private readonly cla: Byte;
  /** INS: Instruction */
  private readonly ins: Byte;
  /** P1: Param 1 */
  private readonly p1: Byte;
  /** P2: Param 2 */
  private readonly p2: Byte;
  /** Lc: Length of data */
  private readonly lc: Byte;
  /** Data */
  private readonly data: Buffer;

  constructor(input: {
    cla?: { chained?: boolean; secure?: boolean };
    ins: Byte;
    p1: Byte;
    p2: Byte;
    data?: Buffer;
  }) {
    const cla = this.determineCla(input.cla);
    const data = input.data ?? Buffer.from([]);

    if (data.length > MAX_COMMAND_APDU_DATA_LENGTH) {
      throw new Error('APDU data exceeds max command APDU data length');
    }
    assert(isByte(data.length));
    const lc = data.length;

    this.cla = cla;
    this.ins = input.ins;
    this.p1 = input.p1;
    this.p2 = input.p2;
    this.lc = lc;
    this.data = data;
  }

  asBuffer(): Buffer {
    return Buffer.concat([
      Buffer.from([this.cla, this.ins, this.p1, this.p2, this.lc]),
      this.data,
    ]);
  }

  asHexString(separator?: string): string {
    const buffer = this.asBuffer();
    const hexString = buffer.toString('hex');
    return separator
      ? splitEvery2Characters(hexString).join(separator)
      : hexString;
  }

  private determineCla(input: { chained?: boolean; secure?: boolean } = {}) {
    if (input.secure) {
      return input.chained ? CLA.SECURE_CHAINED : CLA.SECURE;
    }
    return input.chained ? CLA.CHAINED : CLA.STANDARD;
  }
}

/**
 * A layer of abstraction on top of CommandApdu that supports sending larger amounts of data
 * through multiple, chained APDUs.
 *
 * See CommandApdu for more context.
 */
export class CardCommand {
  /** INS: Instruction */
  private readonly ins: Byte;
  /** P1: Param 1 */
  private readonly p1: Byte;
  /** P2: Param 2 */
  private readonly p2: Byte;
  /** Data */
  private readonly data: Buffer;

  constructor(input: { ins: Byte; p1: Byte; p2: Byte; data?: Buffer }) {
    this.ins = input.ins;
    this.p1 = input.p1;
    this.p2 = input.p2;
    this.data = input.data ?? Buffer.from([]);
  }

  /**
   * The command as a command APDU or command APDU chain
   */
  asCommandApdus(): CommandApdu[] {
    const apdus: CommandApdu[] = [];

    const numApdus = Math.max(
      Math.ceil(this.data.length / MAX_COMMAND_APDU_DATA_LENGTH),
      1 // Always construct at least one APDU since a command APDU with no data is valid
    );
    for (let i = 0; i < numApdus; i += 1) {
      const notLastApdu = i < numApdus - 1;
      apdus.push(
        new CommandApdu({
          cla: { chained: notLastApdu },
          ins: this.ins,
          p1: this.p1,
          p2: this.p2,
          data: this.data.subarray(
            i * MAX_COMMAND_APDU_DATA_LENGTH,
            // Okay if this is larger than this.data.length as .subarray() automatically caps
            i * MAX_COMMAND_APDU_DATA_LENGTH + MAX_COMMAND_APDU_DATA_LENGTH
          ),
        })
      );
    }

    return apdus;
  }
}

/**
 * A TLV, or tag-length-value, is a byte array that consists of:
 * 1. A tag indicating what the value is
 * 2. A length indicating the size of the value in bytes
 * 3. The value itself
 *
 * The data in command and response APDUs is often comprised of TLVs.
 */
export function constructTlv(
  tagAsByteOrBuffer: Byte | Buffer,
  value: Buffer
): Buffer {
  const tag: Buffer = Buffer.isBuffer(tagAsByteOrBuffer)
    ? tagAsByteOrBuffer
    : Buffer.from([tagAsByteOrBuffer]);

  /**
   * The convention for TLV length is as follows:
   * - 0xXX           if value length < 128 bytes
   * - 0x81 0xXX      if value length > 128 and < 256 bytes
   * - 0x82 0xXX 0xXX if value length > 256 and < 65536 bytes
   *
   * For example:
   * - 51 bytes   --> Buffer.from([51])            --> 0x33           (33 is 51 in hex)
   * - 147 bytes  --> Buffer.from([0x81, 147])     --> 0x81 0x93      (93 is 147 in hex)
   * - 3017 bytes --> Buffer.from([0x82, 11, 201]) --> 0x82 0x0b 0xc9 (bc9 is 3017 in hex)
   */
  let tlvLength: Buffer;
  const valueNumBytes = value.length;
  if (valueNumBytes < 128) {
    tlvLength = Buffer.from([valueNumBytes]);
  } else if (valueNumBytes < 256) {
    tlvLength = Buffer.from([0x81, valueNumBytes]);
  } else if (valueNumBytes < 65536) {
    // eslint-disable-next-line no-bitwise
    tlvLength = Buffer.from([0x82, valueNumBytes >> 8, valueNumBytes & 255]);
  } else {
    throw new Error('TLV value is too large');
  }

  return Buffer.concat([tag, tlvLength, value]);
}

/**
 * The inverse of constructTlv, splits a TLV into its tag, length, and value
 */
export function parseTlv(
  tagAsByteOrBuffer: Byte | Buffer,
  tlv: Buffer
): [Buffer, Buffer, Buffer] {
  const tagLength = Buffer.isBuffer(tagAsByteOrBuffer)
    ? tagAsByteOrBuffer.length
    : 1;

  let tlvLengthLength = 1; // Derpiest variable name, I know
  const tlvLengthFirstByte = tlv.at(tagLength);
  if (tlvLengthFirstByte === 0x81) {
    tlvLengthLength = 2;
  } else if (tlvLengthFirstByte === 0x82) {
    tlvLengthLength = 3;
  }

  return [
    tlv.subarray(0, tagLength), // Tag
    tlv.subarray(tagLength, tagLength + tlvLengthLength), // Length
    tlv.subarray(tagLength + tlvLengthLength), // Value
  ];
}

/**
 * A response APDU with an error status word
 */
export class ResponseApduError extends Error {
  private readonly sw1: Byte;
  private readonly sw2: Byte;

  constructor(statusWord: [Byte, Byte]) {
    const [sw1, sw2] = statusWord;
    super(
      'Received response APDU with error status word: ' +
        `${asHexString(sw1)} ${asHexString(sw2)}`
    );
    this.sw1 = sw1;
    this.sw2 = sw2;
  }

  statusWord(): [Byte, Byte] {
    return [this.sw1, this.sw2];
  }

  hasStatusWord(statusWord: [Byte, Byte]): boolean {
    const [sw1, sw2] = statusWord;
    return this.sw1 === sw1 && this.sw2 === sw2;
  }
}
