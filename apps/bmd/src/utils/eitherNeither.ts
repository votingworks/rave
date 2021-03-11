/*
 * Utilities for dealing with Either Neither Questions
 */

import {
  Contest,
  Dictionary,
  Election,
  MsEitherNeitherContest,
  VotesDict,
  YesNoVote,
  getEitherNeitherContests,
} from '@votingworks/types'

import { Tally, MsEitherNeitherTally } from '../config/types'

import { getSingleYesNoVote } from './votes'

interface Params {
  election: Election
  tally: Tally
  votes?: VotesDict
}

interface TallyAndContestIds {
  tally: Tally
  contestIds: Contest['id'][]
}

export const computeTallyForEitherNeitherContests = ({
  election,
  tally,
  votes,
}: Params): TallyAndContestIds => {
  const newTally = [...tally]

  const contestIds: Contest['id'][] = []

  const eitherNeitherContestMappings: Dictionary<MsEitherNeitherContest> = {}
  getEitherNeitherContests(election.contests).forEach((c) => {
    eitherNeitherContestMappings[c.eitherNeitherContestId] = c
    eitherNeitherContestMappings[c.pickOneContestId] = c
  })

  for (const contestId in votes) {
    /* istanbul ignore next */
    if (Object.prototype.hasOwnProperty.call(votes, contestId)) {
      const outerContest = eitherNeitherContestMappings[contestId]
      if (outerContest) {
        contestIds.push(contestId)
        const contestIndex = election.contests.findIndex(
          (c) => c.id === outerContest.id
        )
        const vote = votes[contestId] as YesNoVote
        const singleVote = getSingleYesNoVote(vote)

        if (singleVote) {
          // copy
          const eitherNeitherTally = {
            ...newTally[contestIndex],
          } as MsEitherNeitherTally
          newTally[contestIndex] = eitherNeitherTally

          if (outerContest.eitherNeitherContestId === contestId) {
            // special tabulation rule: if this is 'yes' but no option selected, we cancel the vote.
            if (
              singleVote === 'no' ||
              votes[outerContest.pickOneContestId]?.length === 1
            ) {
              eitherNeitherTally[
                singleVote === 'yes' ? 'eitherOption' : 'neitherOption'
              ]++
            }
          } else {
            eitherNeitherTally[
              singleVote === 'yes' ? 'firstOption' : 'secondOption'
            ]++
          }
        }
      }
    }
  }

  return {
    tally: newTally,
    contestIds,
  }
}
