import { find, throwIllegalValue } from '@votingworks/basics';
import {
  Contest as MarkFlowContest,
  Review as MarkFlowReview,
  PrintPage as MarkFlowPrintPage,
} from '@votingworks/mark-flow-ui';
import {
  ContestId,
  OptionalVote,
  VotesDict,
  getContests,
} from '@votingworks/types';
import { Button, H1, Main, Screen, WithScrollButtons } from '@votingworks/ui';
import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { getElectionConfiguration, saveVotes } from '../../api';
import { ButtonFooter } from '../../components/button_footer';

const ContentHeader = styled.div`
  padding: 0.5rem 0.75rem 0;
`;

export interface MarkScreenProps {
  contestIndex: number;
  votes: VotesDict;
  updateVote: (contestId: ContestId, vote: OptionalVote) => void;
  goNext: () => void;
  goPrevious: () => void;
  goToIndex: (contestIndex: number) => void;
}

export function MarkScreen({
  contestIndex,
  votes,
  updateVote,
  goNext,
  goPrevious,
  goToIndex,
}: MarkScreenProps): JSX.Element | null {
  const [isPrinting, setIsPrinting] = useState(false);
  const printTimer = useRef<number>();
  const saveVotesMutation = saveVotes.useMutation();
  const getElectionConfigurationQuery = getElectionConfiguration.useQuery();
  const electionConfiguration = getElectionConfigurationQuery.data;

  useEffect(() => {
    return () => {
      window.clearTimeout(printTimer.current);
    };
  }, []);

  if (!electionConfiguration) {
    return null;
  }

  const { electionDefinition, ballotStyleId, precinctId } =
    electionConfiguration;
  const ballotStyle = find(
    electionDefinition.election.ballotStyles,
    (bs) => bs.id === ballotStyleId
  );
  const contests = getContests({
    election: electionDefinition.election,
    ballotStyle,
  });

  function printBallot() {
    setIsPrinting(true);
  }

  if (isPrinting) {
    return (
      <MarkFlowPrintPage
        electionDefinition={electionDefinition}
        ballotStyleId={ballotStyleId}
        precinctId={precinctId}
        generateBallotId={() => ''}
        // TODO: use test vs live mode?
        isLiveMode={false}
        votes={votes}
        onPrintStarted={() => {
          printTimer.current = window.setTimeout(
            () => {
              saveVotesMutation.mutate({ votes });
            },
            process.env.IS_INTEGRATION_TEST === 'true' ? 500 : 5000
          );
        }}
      />
    );
  }

  if (contestIndex === contests.length) {
    return (
      <Screen>
        <Main flexColumn>
          <ContentHeader>
            <H1>Review Your Votes</H1>
          </ContentHeader>
          <WithScrollButtons>
            <MarkFlowReview
              election={electionDefinition.election}
              contests={contests}
              precinctId={precinctId}
              votes={votes}
              returnToContest={(contestId) => {
                goToIndex(contests.findIndex((c) => c.id === contestId));
              }}
            />
          </WithScrollButtons>
        </Main>
        <ButtonFooter>
          <Button onPress={printBallot} variant="primary">
            Print My Ballot
          </Button>
        </ButtonFooter>
      </Screen>
    );
  }

  const contest = contests[contestIndex];
  const hasFinishedVotingInThisContest =
    contest.type === 'candidate'
      ? (votes[contest.id]?.length ?? 0) === contest.seats
      : contest.type === 'yesno'
      ? votes[contest.id] !== undefined
      : throwIllegalValue(contest);

  return (
    <Screen>
      <MarkFlowContest
        election={electionDefinition.election}
        contest={contest}
        votes={votes}
        updateVote={updateVote}
      />
      <ButtonFooter>
        <Button onPress={goPrevious} variant="previous">
          Previous
        </Button>
        <Button
          onPress={goNext}
          variant={hasFinishedVotingInThisContest ? 'next' : 'nextSecondary'}
        >
          Next
        </Button>
      </ButtonFooter>
    </Screen>
  );
}
