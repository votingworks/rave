import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { electionSampleDefinition } from '@votingworks/fixtures'
import {
  AdjudicationReason,
  BallotType,
  CandidateContest,
  Contest,
  ContestOption,
  getContests,
  HMPBBallotPageMetadata,
} from '@votingworks/types'
import { find, typedAs } from '@votingworks/utils'
import React from 'react'
import renderInAppContext from '../../test/renderInAppContext'
import WriteInAdjudicationScreen, {
  Props as WriteInAdjudicationScreenProps,
} from './WriteInAdjudicationScreen'

type onAdjudicationCompleteType = Exclude<
  WriteInAdjudicationScreenProps['onAdjudicationComplete'],
  undefined
>

function renderWriteInAdjudicationScreen(): {
  contest: Contest
  optionId: ContestOption['id']
  onAdjudicationComplete: onAdjudicationCompleteType
} {
  const { election } = electionSampleDefinition
  const ballotStyle = election.ballotStyles[0]
  const precinctId = ballotStyle.precincts[0]
  const contests = getContests({ election, ballotStyle })
  const contest = find(
    contests,
    (c): c is CandidateContest => c.type === 'candidate' && c.allowWriteIns
  )
  const optionId: ContestOption['id'] = '__write-in-0'
  const metadata: HMPBBallotPageMetadata = {
    ballotStyleId: ballotStyle.id,
    precinctId,
    ballotType: BallotType.Standard,
    electionHash: '',
    isTestMode: true,
    locales: { primary: 'en-US' },
    pageNumber: 1,
  }

  const onAdjudicationComplete = jest
    .fn<
      ReturnType<onAdjudicationCompleteType>,
      Parameters<onAdjudicationCompleteType>
    >()
    .mockResolvedValue()

  renderInAppContext(
    <WriteInAdjudicationScreen
      sheetId="test-sheet"
      side="front"
      imageURL="/test-sheet/front.jpg"
      interpretation={{
        type: 'InterpretedHmpbPage',
        markInfo: {
          ballotSize: { width: 1, height: 1 },
          marks: [],
        },
        metadata,
        adjudicationInfo: {
          requiresAdjudication: true,
          enabledReasons: [AdjudicationReason.WriteIn],
          allReasonInfos: [
            {
              type: AdjudicationReason.WriteIn,
              contestId: contest.id,
              optionId,
              optionIndex: 0,
            },
          ],
        },
        votes: {},
      }}
      layout={{
        ballotImage: { imageData: { width: 1, height: 1 }, metadata },
        contests: [
          {
            bounds: { x: 0, y: 0, width: 100, height: 100 },
            corners: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
              { x: 0, y: 100 },
            ],
            options: [
              {
                bounds: { x: 0, y: 50, width: 100, height: 50 },
                target: {
                  bounds: { x: 20, y: 60, width: 20, height: 10 },
                  inner: { x: 22, y: 62, width: 16, height: 6 },
                },
              },
            ],
          },
        ],
      }}
      contestIds={[contest.id]}
      onAdjudicationComplete={onAdjudicationComplete}
    />
  )

  return { contest, optionId, onAdjudicationComplete }
}

test('supports typing in a candidate name', async () => {
  const {
    contest,
    optionId,
    onAdjudicationComplete,
  } = renderWriteInAdjudicationScreen()

  screen.getByText('Write-In Adjudication')
  screen.getByText(contest.title)

  userEvent.type(
    screen.getByTestId(`write-in-input-${optionId}`),
    'Lizard People'
  )

  expect(onAdjudicationComplete).not.toHaveBeenCalled()
  userEvent.click(screen.getByText('Save & Continue Scanning'))

  await waitFor(() => {
    expect(onAdjudicationComplete).toHaveBeenCalledWith(
      ...typedAs<Parameters<onAdjudicationCompleteType>>([
        'test-sheet',
        'front',
        [
          {
            type: AdjudicationReason.WriteIn,
            isWriteIn: true,
            contestId: contest.id,
            optionId,
            name: 'Lizard People',
          },
        ],
      ])
    )
  })
})

test('supports canceling a write-in', async () => {
  const {
    contest,
    optionId,
    onAdjudicationComplete,
  } = renderWriteInAdjudicationScreen()

  screen.getByText('Write-In Adjudication')
  screen.getByText(contest.title)

  const isWriteInCheckbox = screen.getByTestId(
    `write-in-checkbox-${optionId}`
  ) as HTMLInputElement
  expect(isWriteInCheckbox.checked).toBe(true)
  userEvent.click(isWriteInCheckbox)

  expect(onAdjudicationComplete).not.toHaveBeenCalled()
  userEvent.click(screen.getByText('Save & Continue Scanning'))

  await waitFor(() => {
    expect(onAdjudicationComplete).toHaveBeenCalledWith(
      ...typedAs<Parameters<onAdjudicationCompleteType>>([
        'test-sheet',
        'front',
        [
          {
            type: AdjudicationReason.WriteIn,
            isWriteIn: false,
            contestId: contest.id,
            optionId,
          },
        ],
      ])
    )
  })
})
