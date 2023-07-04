import { electionMinimalExhaustiveSampleDefinition } from '@votingworks/fixtures';
import { hasTextAcrossElements } from '@votingworks/test-utils';
import { render, screen, within } from '../../test/react_testing_library';

import { ContestWriteInSummaryTable } from './contest_write_in_summary_table';

test('renders official candidates', () => {
  const { election } = electionMinimalExhaustiveSampleDefinition;
  render(
    <ContestWriteInSummaryTable
      election={election}
      contestWriteInSummary={{
        contestId: 'zoo-council-mammal',
        totalTally: 40,
        pendingTally: 19,
        invalidTally: 1,
        candidateTallies: {
          zebra: {
            id: 'zebra',
            name: 'Zebra',
            tally: 15,
          },
          lion: {
            id: 'lion',
            name: 'Lion',
            tally: 5,
          },
        },
      }}
    />
  );

  screen.getByRole('heading', { name: 'Zoo Council' });
  screen.getByText('District 1');
  screen.getByText(
    hasTextAcrossElements('40 total write-ins / 19 not adjudicated')
  );
  within(screen.getByText('Invalid').closest('tr')!).getByText('1');
  screen.getByText('Official Candidates');
  within(screen.getByText('Zebra').closest('tr')!).getByText('15');
  within(screen.getByText('Lion').closest('tr')!).getByText('5');

  expect(screen.queryByText('Write-In Candidates')).not.toBeInTheDocument();
});

test('renders write-in candidates', () => {
  const { election } = electionMinimalExhaustiveSampleDefinition;
  render(
    <ContestWriteInSummaryTable
      election={election}
      contestWriteInSummary={{
        contestId: 'zoo-council-mammal',
        totalTally: 40,
        pendingTally: 19,
        invalidTally: 0,
        candidateTallies: {
          rapidash: {
            id: 'rapidash',
            name: 'Rapidash',
            tally: 20,
            isWriteIn: true,
          },
          slaking: {
            id: 'slaking',
            name: 'Slaking',
            tally: 1,
            isWriteIn: true,
          },
        },
      }}
    />
  );

  screen.getByRole('heading', { name: 'Zoo Council' });
  screen.getByText('District 1');
  screen.getByText(
    hasTextAcrossElements('40 total write-ins / 19 not adjudicated')
  );
  screen.getByText('Write-In Candidates');
  within(screen.getByText('Rapidash').closest('tr')!).getByText('20');
  within(screen.getByText('Slaking').closest('tr')!).getByText('1');

  expect(screen.queryByText('Official Candidates')).not.toBeInTheDocument();
  expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
});

test('renders headers only if none adjudicated', () => {
  const { election } = electionMinimalExhaustiveSampleDefinition;
  render(
    <ContestWriteInSummaryTable
      election={election}
      contestWriteInSummary={{
        contestId: 'zoo-council-mammal',
        totalTally: 40,
        pendingTally: 40,
        invalidTally: 0,
        candidateTallies: {},
      }}
    />
  );

  screen.getByRole('heading', { name: 'Zoo Council' });
  screen.getByText('District 1');
  screen.getByText(
    hasTextAcrossElements('40 total write-ins / 40 not adjudicated')
  );

  expect(screen.queryByText('Official Candidates')).not.toBeInTheDocument();
  expect(screen.queryByText('Write-In Candidates')).not.toBeInTheDocument();
  expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
});
