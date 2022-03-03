import { safeParseElectionDefinition } from '@votingworks/types';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Fixture } from '../../fixtures';

export const electionDefinition = safeParseElectionDefinition(
  readFileSync(join(__dirname, 'election.json'), 'utf-8')
).unsafeUnwrap();
export const { election } = electionDefinition;
export const electionPath = join(__dirname, 'election.json');
export const blankPage1 = new Fixture(join(__dirname, 'blank-p1.jpg'));
export const blankPage2 = new Fixture(join(__dirname, 'blank-p2.jpg'));
export const filledInPage1 = new Fixture(join(__dirname, 'filled-in-p1.jpg'));
export const filledInPage2 = new Fixture(join(__dirname, 'filled-in-p2.jpg'));
export const partialBorderPage2 = new Fixture(
  join(__dirname, 'extra-contest-detected-p2.jpg')
);
