import { strict as assert } from 'assert'

import {
  CandidateVote,
  Election,
  getBallotStyle,
  getContests,
  VotesDict,
  YesNoVote,
} from '@votingworks/types'
import {
  CandidateVoteTally,
  MsEitherNeitherTally,
  Tally,
  YesNoVoteTally,
} from '../config/types'
import { computeTallyForEitherNeitherContests } from './eitherNeither'
import { getSingleYesNoVote } from './votes'

const combineCandidateTallies = (
  tally1: CandidateVoteTally,
  tally2: CandidateVoteTally
): CandidateVoteTally => {
  const candidates = []
  assert(tally1.candidates.length === tally2.candidates.length)
  for (let i = 0; i < tally1.candidates.length; i++) {
    candidates.push(tally1.candidates[i] + tally2.candidates[i])
  }
  const writeInVotes = tally1.writeIns
  for (const writeInVote of tally2.writeIns) {
    const existingWriteInIdx = writeInVotes.findIndex(
      (v) => v.name === writeInVote.name
    )
    if (existingWriteInIdx >= 0) {
      writeInVotes[existingWriteInIdx].tally += writeInVote.tally
    } else {
      writeInVotes.push(writeInVote)
    }
  }
  return {
    candidates,
    undervotes: tally1.undervotes + tally2.undervotes,
    writeIns: writeInVotes,
  }
}

const combineYesNoTallies = (
  tally1: YesNoVoteTally,
  tally2: YesNoVoteTally
): YesNoVoteTally => {
  return {
    yes: tally1.yes + tally2.yes,
    no: tally1.no + tally2.no,
    undervotes: tally1.undervotes + tally2.undervotes,
  }
}

const combineEitherNeitherTallies = (
  tally1: MsEitherNeitherTally,
  tally2: MsEitherNeitherTally
): MsEitherNeitherTally => {
  return {
    eitherOption: tally1.eitherOption + tally2.eitherOption,
    neitherOption: tally1.neitherOption + tally2.neitherOption,
    eitherNeitherUndervotes:
      tally1.eitherNeitherUndervotes + tally2.eitherNeitherUndervotes,
    firstOption: tally1.firstOption + tally2.firstOption,
    secondOption: tally1.secondOption + tally2.secondOption,
    pickOneUndervotes: tally1.pickOneUndervotes + tally2.pickOneUndervotes,
  }
}

export const combineTallies = (
  election: Election,
  tally1: Tally,
  tally2: Tally
): Tally => {
  assert(
    election.contests.length === tally1.length &&
      tally1.length === tally2.length
  )
  const combinedTally = [] as Tally

  for (let i = 0; i < election.contests.length; i += 1) {
    const contest = election.contests[i]
    const tally1Row = tally1[i]
    const tally2Row = tally2[i]
    switch (contest.type) {
      case 'candidate':
        combinedTally.push(
          combineCandidateTallies(
            tally1Row as CandidateVoteTally,
            tally2Row as CandidateVoteTally
          )
        )
        break
      case 'yesno':
        combinedTally.push(
          combineYesNoTallies(
            tally1Row as YesNoVoteTally,
            tally2Row as YesNoVoteTally
          )
        )
        break
      case 'ms-either-neither':
        combinedTally.push(
          combineEitherNeitherTallies(
            tally1Row as MsEitherNeitherTally,
            tally2Row as MsEitherNeitherTally
          )
        )
        break
    }
  }

  return combinedTally
}

export const calculateTally = ({
  election,
  tally: prevTally,
  votes,
  ballotStyleId,
}: {
  election: Election
  tally: Tally
  votes: VotesDict
  ballotStyleId: string
}): Tally => {
  const ballotStyle = getBallotStyle({
    ballotStyleId,
    election,
  })!
  const contestsForBallotStyle = getContests({
    election,
    ballotStyle,
  })
  // first update the tally for either-neither contests
  const tally = computeTallyForEitherNeitherContests({
    election,
    tally: prevTally,
    votes,
    contests: contestsForBallotStyle,
  })

  for (const contest of contestsForBallotStyle) {
    if (contest.type === 'ms-either-neither') {
      continue
    }

    const contestIndex = election.contests.findIndex((c) => c.id === contest.id)
    /* istanbul ignore next */
    if (contestIndex < 0) {
      throw new Error(`No contest found for contestId: ${contest.id}`)
    }
    const contestTally = tally[contestIndex]
    /* istanbul ignore else */
    if (contest.type === 'yesno') {
      const yesnoContestTally = contestTally as YesNoVoteTally
      const vote = votes[contest.id] as YesNoVote
      const yesnovote = getSingleYesNoVote(vote)!
      if (yesnovote === undefined) {
        yesnoContestTally.undervotes++
      } else {
        yesnoContestTally[yesnovote]++
      }
    } else if (contest.type === 'candidate') {
      const candidateContestTally = contestTally as CandidateVoteTally
      const vote = (votes[contest.id] ?? []) as CandidateVote
      vote.forEach((candidate) => {
        if (candidate.isWriteIn) {
          const tallyContestWriteIns = candidateContestTally.writeIns
          const writeIn = tallyContestWriteIns.find(
            (c) => c.name === candidate.name
          )
          if (typeof writeIn === 'undefined') {
            tallyContestWriteIns.push({
              name: candidate.name,
              tally: 1,
            })
          } else {
            writeIn.tally++
          }
        } else {
          const candidateIndex = contest.candidates.findIndex(
            (c) => c.id === candidate.id
          )
          if (
            candidateIndex < 0 ||
            candidateIndex >= candidateContestTally.candidates.length
          ) {
            throw new Error(
              `unable to find a candidate with id: ${candidate.id}`
            )
          }
          candidateContestTally.candidates[candidateIndex]++
        }
      })
      candidateContestTally.undervotes += contest.seats - vote.length
    }
  }
  return tally
}
