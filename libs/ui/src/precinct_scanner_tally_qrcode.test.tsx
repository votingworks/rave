import React from 'react';
import { render, act, screen } from '@testing-library/react';
import {
  electionSample,
  electionSampleDefinition,
} from '@votingworks/fixtures';
import { CastVoteRecord } from '@votingworks/types';
import {
  calculateTallyForCastVoteRecords,
  compressTally,
} from '@votingworks/utils';
import { fakeKiosk, mockOf } from '@votingworks/test-utils';

import { PrecinctScannerTallyQrCode } from './precinct_scanner_tally_qrcode';

afterEach(() => {
  window.kiosk = undefined;
});

const time = new Date(2021, 8, 19, 11, 5).getTime();

const cvr: CastVoteRecord = {
  _precinctId: electionSample.precincts[0].id,
  _ballotId: 'test-123',
  _ballotStyleId: electionSample.ballotStyles[0].id,
  _batchId: 'batch-1',
  _batchLabel: 'batch-1',
  _ballotType: 'standard',
  _testBallot: false,
  _scannerId: 'DEMO-0000',
  'county-commissioners': ['argent'],
};

test('renders WITHOUT results reporting when there are CVRs but polls are open', async () => {
  const mockKiosk = fakeKiosk();
  mockOf(mockKiosk.sign).mockResolvedValue('FAKESIGNATURE');
  window.kiosk = mockKiosk;

  const tally = calculateTallyForCastVoteRecords(
    electionSample,
    new Set([cvr])
  );
  const compressedTally = compressTally(electionSample, tally);

  await act(async () => {
    render(
      <PrecinctScannerTallyQrCode
        reportSavedTime={time}
        electionDefinition={electionSampleDefinition}
        reportPurpose="Testing"
        isPollsOpen
        isLiveMode
        compressedTally={compressedTally}
        signingMachineId="0001"
      />
    );
  });

  expect(screen.queryByText('Automatic Election Results Reporting')).toBeNull();
});

test('renders with results reporting when there are CVRs and polls are closed', async () => {
  const mockKiosk = fakeKiosk();
  mockOf(mockKiosk.sign).mockResolvedValue('FAKESIGNATURE');
  window.kiosk = mockKiosk;

  const tally = calculateTallyForCastVoteRecords(
    electionSample,
    new Set([cvr])
  );
  const compressedTally = compressTally(electionSample, tally);

  await act(async () => {
    render(
      <PrecinctScannerTallyQrCode
        reportSavedTime={time}
        electionDefinition={electionSampleDefinition}
        reportPurpose="Testing"
        isPollsOpen={false}
        isLiveMode
        compressedTally={compressedTally}
        signingMachineId="DEMO-0000"
      />
    );
  });

  const payloadComponents = mockKiosk.sign.mock.calls[0][0].payload.split('.');
  expect(payloadComponents).toEqual([
    electionSampleDefinition.electionHash,
    'DEMO-0000',
    '1', // live election
    expect.any(String),
    expect.any(String),
  ]);

  expect(
    screen.queryByText('Automatic Election Results Reporting')
  ).toBeTruthy();
});

test('renders with results reporting when there are CVRs and polls are closed in testing mode', async () => {
  const mockKiosk = fakeKiosk();
  mockOf(mockKiosk.sign).mockResolvedValue('FAKESIGNATURE');
  window.kiosk = mockKiosk;

  const testCvr = {
    ...cvr,
    _testBallot: true,
  };
  const tally = calculateTallyForCastVoteRecords(
    electionSample,
    new Set([testCvr])
  );
  const compressedTally = compressTally(electionSample, tally);

  await act(async () => {
    render(
      <PrecinctScannerTallyQrCode
        reportSavedTime={time}
        electionDefinition={electionSampleDefinition}
        reportPurpose="Testing"
        isPollsOpen={false}
        isLiveMode={false}
        compressedTally={compressedTally}
        signingMachineId="DEMO-0000"
      />
    );
  });

  const payloadComponents = mockKiosk.sign.mock.calls[0][0].payload.split('.');
  expect(payloadComponents).toEqual([
    electionSampleDefinition.electionHash,
    'DEMO-0000',
    '0', // live election
    expect.any(String),
    expect.any(String),
  ]);

  expect(
    screen.queryByText('Automatic Election Results Reporting')
  ).toBeTruthy();
});

test('renders with unsigned results reporting when there is no kiosk', async () => {
  window.kiosk = undefined;
  const tally = calculateTallyForCastVoteRecords(
    electionSample,
    new Set([cvr])
  );
  const compressedTally = compressTally(electionSample, tally);

  await act(async () => {
    render(
      <PrecinctScannerTallyQrCode
        reportSavedTime={time}
        electionDefinition={electionSampleDefinition}
        reportPurpose="Testing"
        isPollsOpen={false}
        isLiveMode
        compressedTally={compressedTally}
        signingMachineId="DEMO-0000"
      />
    );
  });

  expect(
    screen.queryByText('Automatic Election Results Reporting')
  ).toBeTruthy();
});
