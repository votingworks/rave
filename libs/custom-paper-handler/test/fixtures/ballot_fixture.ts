import fs from 'fs';
import path from 'path';

const filename = path.join(__dirname, 'ballot.pdf');
export const ballotFixture: Uint8Array = fs.readFileSync(filename);
