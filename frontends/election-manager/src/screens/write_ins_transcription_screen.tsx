import React from 'react';
import styled from 'styled-components';

import {
  BallotId,
  ContestId,
  CandidateContest,
  CastVoteRecord,
  Election,
  getPartyAbbreviationByPartyId,
} from '@votingworks/types';
import { Button, Main, Screen, Text } from '@votingworks/ui';
import { assert } from '@votingworks/utils';
import { Navigation } from '../components/navigation';
import { TextInput } from '../components/text_input';

const BallotPreviews = styled.div`
  flex: 3;
  padding: 1rem;
`;

const TranscriptionContainer = styled.div`
  display: flex;
  flex: 2;
  flex-direction: column;
  border-left: 1px solid #cccccc;
`;

const TranscriptionMainContentContainer = styled.div`
  flex: 1;
  overflow: scroll;
  padding: 1rem;
`;

const PreviouslyTranscribedValuesContainer = styled.div``;

const PreviouslyTranscribedValueButtonWrapper = styled.div`
  display: inline-block;
  margin: 0.5rem 0.5rem 0 0;
`;

const TranscriptionPaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #cccccc;
  background: #ffffff;
  width: 100%;
  padding: 0.5rem 1rem;
`;

/* isntabul ignore next */
function noop() {
  // nothing to do
}

export function WriteInsTranscriptionScreen({
  contest,
  election,
  ballotIdxBeingAdjudicated,
  ballotsBeingAdjudicated,
  onClickNext,
  onClickPrevious,
  onClose,
  onListAll,
  saveTranscribedValue,
}: {
  contest: CandidateContest;
  election: Election;
  ballotIdxBeingAdjudicated: number;
  ballotsBeingAdjudicated: readonly CastVoteRecord[];
  onClickNext?: () => void;
  onClickPrevious?: () => void;
  onClose: () => void;
  onListAll: () => void;
  saveTranscribedValue: (
    ballotId: BallotId,
    contestId: ContestId,
    transcribedValue: string
  ) => void;
}): JSX.Element {
  const previouslyTranscribedValues = [
    'Mickey Mouse',
    'Mickey M',
    'Micky',
    'Donald',
    'Donald Duck',
    'Roger Rabbit',
    'RR',
    'DD',
    'M. Mouse',
  ];

  assert(contest);
  assert(election);
  const currentBallot = ballotsBeingAdjudicated[ballotIdxBeingAdjudicated];
  const ballotId = currentBallot._ballotId as BallotId;
  return (
    <Screen>
      <Navigation
        screenTitle="Write-In Adjudication"
        secondaryNav={
          <React.Fragment>
            <Button small onPress={onListAll}>
              List All
            </Button>
            <Button small onPress={onClose}>
              Exit
            </Button>
          </React.Fragment>
        }
      />
      <Main flexRow>
        <BallotPreviews>BALLOT IMAGES GO HERE</BallotPreviews>
        <TranscriptionContainer>
          <TranscriptionMainContentContainer>
            {election && contest.partyId && (
              <React.Fragment>
                <Text bold>{contest.section}</Text>
                <h1>
                  {contest.title} (
                  {getPartyAbbreviationByPartyId({
                    partyId: contest.partyId,
                    election,
                  })}
                  )
                </h1>
              </React.Fragment>
            )}
            <Text>
              <label htmlFor="transcription-value">Transcribed Value</label>
            </Text>
            <TextInput id="transcribed-value" name="transcribed-value" />
            <PreviouslyTranscribedValuesContainer>
              {previouslyTranscribedValues.map((transcribedValue) => (
                <PreviouslyTranscribedValueButtonWrapper key={transcribedValue}>
                  <Button
                    onPress={() =>
                      saveTranscribedValue(
                        ballotId,
                        contest.id,
                        transcribedValue
                      )
                    }
                  >
                    {transcribedValue}
                  </Button>
                </PreviouslyTranscribedValueButtonWrapper>
              ))}
            </PreviouslyTranscribedValuesContainer>
          </TranscriptionMainContentContainer>
          <TranscriptionPaginationContainer>
            <Button
              disabled={!onClickPrevious}
              onPress={onClickPrevious || noop}
            >
              Previous
            </Button>
            <Text bold>
              {ballotIdxBeingAdjudicated + 1} of{' '}
              {ballotsBeingAdjudicated.length}
            </Text>
            <Button disabled={!onClickNext} onPress={onClickNext || noop}>
              Next
            </Button>
          </TranscriptionPaginationContainer>
        </TranscriptionContainer>
      </Main>
    </Screen>
  );
}