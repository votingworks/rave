import {
  BallotScreenProps,
  PartyReportScreenProps,
  PrecinctReportScreenProps,
  ScannerReportScreenProps,
  VotingMethodReportScreenProps,
} from './config/types'

const routerPaths = {
  root: '/',
  electionDefinition: '/definition',
  definitionEditor: '/definition/editor',
  definitionContest: ({ contestId }: { contestId: string }): string =>
    `/definition/contests/${contestId}`,
  smartcards: '/cards',
  ballotsList: '/ballots',
  ballotsView: ({ ballotStyleId, precinctId }: BallotScreenProps): string =>
    `/ballots/style/${ballotStyleId}/precinct/${precinctId}`,
  ballotsViewLanguage: ({
    ballotStyleId,
    precinctId,
    localeCode,
  }: BallotScreenProps): string =>
    `/ballots/style/${ballotStyleId}/precinct/${precinctId}/language/${localeCode}`,
  manualDataImport: '/tally/manual-data-import',
  printedBallotsReport: '/ballots/printed-report',
  tally: '/tally',
  printTestDecks: '/tally/print-test-deck',
  printOneTestDeck: ({ precinctId }: PrecinctReportScreenProps): string =>
    `/tally/print-test-deck/${precinctId}`,
  tallyPrecinctReport: ({ precinctId }: PrecinctReportScreenProps): string =>
    `/tally/precinct/${precinctId}`,
  tallyPartyReport: ({ partyId }: PartyReportScreenProps): string =>
    `/tally/party/${partyId}`,
  tallyVotingMethodReport: ({
    votingMethod,
  }: VotingMethodReportScreenProps): string =>
    `/tally/votingmethod/${votingMethod}`,
  tallyScannerReport: ({ scannerId }: ScannerReportScreenProps): string =>
    `/tally/scanner/${scannerId}`,
  tallyFullReport: '/tally/full',
  testDecksTally: '/tally/test-ballot-deck',
  testDeckResultsReport: ({ precinctId }: PrecinctReportScreenProps): string =>
    `/tally/test-ballot-deck/${precinctId}`,
  overvoteCombinationReport: '/tally/pairs',
  combineResultsFiles: '/tally/combine-results-files',
}

export default routerPaths
