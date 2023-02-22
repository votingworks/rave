import { assert, find } from '@votingworks/basics';
import { electionMinimalExhaustiveSampleDefinition } from '@votingworks/fixtures';
import { CandidateContest, CVR, YesNoContest } from '@votingworks/types';
import {
  advanceTo as setMockDate,
  clear as clearMockDate,
} from 'jest-date-mock';
import { buildCastVoteRecordReport } from './build_report_metadata';

const { election, electionHash } = electionMinimalExhaustiveSampleDefinition;

const scannerId = 'SC-00-000';
const mockDate = new Date(2018, 5, 27, 0, 0, 0);
const electionId = electionHash;

test('builds well-formed cast vote record report', () => {
  setMockDate(mockDate);
  const report = buildCastVoteRecordReport({
    election,
    electionId,
    generatingDeviceId: scannerId,
    scannerIds: [scannerId],
    reportTypes: [CVR.ReportType.OriginatingDeviceExport],
    isTestMode: false,
    batchInfo: [
      {
        id: 'batch-1',
        label: 'Batch 1',
      },
    ],
  });

  expect(report.ReportType).toEqual([CVR.ReportType.OriginatingDeviceExport]);
  expect(report.OtherReportType).toBeUndefined();
  expect(report.Version).toEqual(CVR.CastVoteRecordVersion.v1_0_0);
  expect(report.GeneratedDate).toEqual('2018-06-27T00:00:00.000Z');
  expect(report.ReportGeneratingDeviceIds).toEqual([scannerId]);
  expect(report.ReportingDevice).toMatchObject([
    {
      '@id': scannerId,
      SerialNumber: scannerId,
      Manufacturer: 'VotingWorks',
    },
  ]);
  expect(report.Batch).toMatchObject([
    {
      '@id': 'batch-1',
      BatchLabel: 'Batch 1',
    },
  ]);

  // Check GpUnits
  expect(report.GpUnit).toHaveLength(election.precincts.length + 2);
  for (const precinct of election.precincts) {
    expect(report.GpUnit).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@id': precinct.id,
          Type: CVR.ReportingUnitType.Precinct,
          Name: precinct.name,
        }),
      ])
    );
  }
  expect(report.GpUnit).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        '@id': 'election-state',
        Type: CVR.ReportingUnitType.Other,
        Name: 'State of Sample',
      }),
    ])
  );
  expect(report.GpUnit).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        '@id': 'election-county',
        Type: CVR.ReportingUnitType.Other,
        Name: 'Sample County',
      }),
    ])
  );

  // Check parties
  expect(report.Party).toHaveLength(election.parties.length);
  for (const party of election.parties) {
    expect(report.Party).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@id': party.id,
          Name: party.fullName,
          Abbreviation: party.abbrev,
        }),
      ])
    );
  }

  const ReportElection = report.Election[0];
  assert(ReportElection);
  expect(ReportElection['@id']).toEqual(electionId);
  expect(ReportElection.Name).toEqual(election.title);

  // Check candidate list
  const candidateContests = election.contests.filter(
    (contest): contest is CandidateContest => contest.type === 'candidate'
  );
  expect(ReportElection.Candidate?.length).toEqual(
    candidateContests
      .map((contest) => contest.candidates.length)
      .reduce((prev, cur) => prev + cur, 0)
  );
  for (const candidate of candidateContests.flatMap(
    (contest) => contest.candidates
  )) {
    expect(ReportElection.Candidate).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@id': candidate.id,
          Name: candidate.name,
        }),
      ])
    );
  }

  expect(ReportElection.Contest).toHaveLength(election.contests.length);

  // Check candidate contests
  const ReportCandidateContests = ReportElection.Contest.filter(
    (ReportContest): ReportContest is CVR.CandidateContest =>
      ReportContest['@type'] === 'CVR.CandidateContest'
  );
  expect(ReportCandidateContests).toHaveLength(candidateContests.length);
  for (const candidateContest of candidateContests) {
    const ReportCandidateContest = find(
      ReportCandidateContests,
      (c) => c['@id'] === candidateContest.id
    );
    expect(ReportCandidateContest.Name).toEqual(candidateContest.title);
    expect(ReportCandidateContest.VotesAllowed).toEqual(candidateContest.seats);
    expect(ReportCandidateContest.PrimaryPartyId).toEqual(
      candidateContest.partyId
    );
    expect(ReportCandidateContest.ContestSelection).toHaveLength(
      candidateContest.candidates.length +
        (candidateContest.allowWriteIns ? candidateContest.seats : 0)
    );
    for (const candidate of candidateContest.candidates) {
      expect(ReportCandidateContest.ContestSelection).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            '@id': candidate.id,
            CandidateIds: [candidate.id],
          }),
        ])
      );
    }
    if (candidateContest.allowWriteIns) {
      for (let i = 0; i < candidateContest.seats; i += 1) {
        expect(ReportCandidateContest.ContestSelection).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              '@id': `write-in-${i}`,
              IsWriteIn: true,
            }),
          ])
        );
      }
    }
  }

  // Check ballot measure contests
  const ballotMeasureContests = election.contests.filter(
    (contest): contest is YesNoContest => contest.type === 'yesno'
  );
  const ReportBallotMeasureContests = ReportElection.Contest.filter(
    (ReportContest): ReportContest is CVR.BallotMeasureContest =>
      ReportContest['@type'] === 'CVR.BallotMeasureContest'
  );
  expect(ReportBallotMeasureContests).toHaveLength(
    ballotMeasureContests.length
  );
  for (const ballotMeasureContest of ballotMeasureContests) {
    expect(ReportBallotMeasureContests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@id': ballotMeasureContest.id,
          Name: ballotMeasureContest.title,
          ContestSelection: [
            expect.objectContaining({
              '@id': 'yes',
              Selection: 'yes',
            }),
            expect.objectContaining({
              '@id': 'no',
              Selection: 'no',
            }),
          ],
        }),
      ])
    );
  }

  clearMockDate();
});

test('represents test mode as an "OtherReportType"', () => {
  const report = buildCastVoteRecordReport({
    election,
    electionId,
    generatingDeviceId: scannerId,
    scannerIds: [scannerId],
    reportTypes: [CVR.ReportType.OriginatingDeviceExport],
    isTestMode: true,
    batchInfo: [],
  });

  expect(report.ReportType).toEqual([
    CVR.ReportType.OriginatingDeviceExport,
    CVR.ReportType.Other,
  ]);
  expect(report.OtherReportType).toEqual('test');
});

test('still includes the generating device id in the device list if it is not the scanner id', () => {
  const generatingDeviceId = 'AD-00-000';
  const report = buildCastVoteRecordReport({
    election,
    electionId,
    generatingDeviceId,
    scannerIds: [scannerId],
    reportTypes: [CVR.ReportType.OriginatingDeviceExport],
    isTestMode: true,
    batchInfo: [],
  });

  expect(report.ReportGeneratingDeviceIds).toEqual([generatingDeviceId]);
  expect(report.ReportingDevice).toMatchObject(
    expect.arrayContaining([
      expect.objectContaining({
        '@id': scannerId,
        SerialNumber: scannerId,
        Manufacturer: 'VotingWorks',
      }),
      expect.objectContaining({
        '@id': generatingDeviceId,
        SerialNumber: generatingDeviceId,
        Manufacturer: 'VotingWorks',
      }),
    ])
  );
});