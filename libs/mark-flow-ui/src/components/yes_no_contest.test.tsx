import { electionMinimalExhaustiveSample } from '@votingworks/fixtures';
import { YesNoContest as YesNoContestInterface } from '@votingworks/types';
import userEvent from '@testing-library/user-event';
import { advanceTimers } from '@votingworks/test-utils';
import { screen, within, render } from '../../test/react_testing_library';
import { YesNoContest } from './yes_no_contest';

const contest = electionMinimalExhaustiveSample.contests.find(
  (c) => c.id === 'fishing' && c.type === 'yesno'
) as YesNoContestInterface;

test('voting for both yes and no', () => {
  const updateVote = jest.fn();
  const { container } = render(
    <YesNoContest
      election={electionMinimalExhaustiveSample}
      contest={contest}
      updateVote={updateVote}
    />
  );
  expect(container).toMatchSnapshot();

  const contestChoices = screen.getByTestId('contest-choices');
  userEvent.click(within(contestChoices).getByText('Yes').closest('button')!);
  expect(updateVote).toHaveBeenCalledTimes(1);

  userEvent.click(within(contestChoices).getByText('No').closest('button')!);
  expect(updateVote).toHaveBeenCalledTimes(2);
});

test('changing votes', () => {
  const updateVote = jest.fn();
  const { container } = render(
    <YesNoContest
      election={electionMinimalExhaustiveSample}
      contest={contest}
      vote={['yes']}
      updateVote={updateVote}
    />
  );
  expect(container).toMatchSnapshot();
  const contestChoices = screen.getByTestId('contest-choices');
  userEvent.click(within(contestChoices).getByText('No').closest('button')!);
  expect(
    screen.getAllByText(
      (_, element) =>
        element?.textContent ===
        'Do you want to change your vote to No? To change your vote, first unselect your vote for Yes.'
    )
  ).toBeTruthy();
  userEvent.click(screen.getByText('Okay'));
});

test('audio cue for vote', () => {
  jest.useFakeTimers();

  const updateVote = jest.fn();
  const { rerender } = render(
    <YesNoContest
      election={electionMinimalExhaustiveSample}
      contest={contest}
      updateVote={updateVote}
    />
  );

  const contestChoices = screen.getByTestId('contest-choices');
  const yesButton = within(contestChoices).getByText('Yes').closest('button')!;

  // initial state just has a description of the choice
  expect(yesButton).toHaveAccessibleName('Yes on Ballot Measure 3');
  userEvent.click(yesButton);

  // manually handle updating the vote
  rerender(
    <YesNoContest
      election={electionMinimalExhaustiveSample}
      contest={contest}
      vote={['yes']}
      updateVote={updateVote}
    />
  );

  // now the choice is selected
  expect(yesButton).toHaveAccessibleName('Selected, Yes on Ballot Measure 3');

  // unselect the choice
  userEvent.click(yesButton);

  // manually handle updating the vote
  rerender(
    <YesNoContest
      election={electionMinimalExhaustiveSample}
      contest={contest}
      vote={[]}
      updateVote={updateVote}
    />
  );

  // now the choice is deselected
  expect(yesButton).toHaveAccessibleName('Deselected, Yes on Ballot Measure 3');

  // after a second, the choice is no longer selected or deselected
  advanceTimers(1);
  expect(yesButton).toHaveAccessibleName('Yes on Ballot Measure 3');
});
