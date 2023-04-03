/**
 * The result of calling `interpret`.
 */
export interface BridgeInterpretResult {
  success: boolean;
  value: string;
}

/**
 * Type of the Rust `interpret` implementation. Under normal circumstances,
 * `success` will be true and `value` will be an `InterpretedBallotCard` as
 * JSON. If `success` is false, `value` will be an error object as JSON.
 */
export function interpret(
  electionJson: string,
  ballotImagePath1: string,
  ballotImagePath2: string,
  debug: boolean
): BridgeInterpretResult;