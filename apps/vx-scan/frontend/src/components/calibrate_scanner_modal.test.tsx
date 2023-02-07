import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { deferred } from '@votingworks/basics';
import userEvent from '@testing-library/user-event';
// eslint-disable-next-line vx/gts-no-import-export-type
import type { PrecinctScannerStatus } from '@votingworks/vx-scan-backend';
import {
  CalibrateScannerModal,
  CalibrateScannerModalProps,
} from './calibrate_scanner_modal';
import { createApiMock, provideApi } from '../../test/helpers/mock_api_client';

const fakeScannerStatus: PrecinctScannerStatus = {
  state: 'no_paper',
  ballotsCounted: 0,
  canUnconfigure: true,
};

const apiMock = createApiMock();

function renderModal(props: Partial<CalibrateScannerModalProps> = {}) {
  return render(
    provideApi(
      apiMock,
      <CalibrateScannerModal
        scannerStatus={fakeScannerStatus}
        onCancel={jest.fn()}
        {...props}
      />
    )
  );
}

beforeEach(() => {
  apiMock.mockApiClient.reset();
});

afterEach(() => {
  apiMock.mockApiClient.assertComplete();
});

test('shows instructions', () => {
  apiMock.expectCheckCalibrationSupported(true);
  renderModal();

  screen.getByRole('heading', { name: 'Calibrate Scanner' });
  screen.getByText(/blank sheet of white paper/);
});

test('waiting for paper', async () => {
  const onCancel = jest.fn();
  apiMock.expectCheckCalibrationSupported(true);
  renderModal({ onCancel });

  expect(
    (await screen.findByText<HTMLButtonElement>('Waiting for Paper')).disabled
  ).toEqual(true);

  userEvent.click(await screen.findByText('Cancel'));
  expect(onCancel).toHaveBeenCalled();
});

test('scanner not available', async () => {
  const onCancel = jest.fn();
  apiMock.expectCheckCalibrationSupported(true);
  renderModal({
    scannerStatus: { ...fakeScannerStatus, state: 'jammed' },
    onCancel,
  });

  expect(
    (await screen.findByText<HTMLButtonElement>('Cannot Calibrate')).disabled
  ).toEqual(true);

  userEvent.click(await screen.findByText('Cancel'));
  expect(onCancel).toHaveBeenCalled();
});

test('calibrate success', async () => {
  const { promise, resolve } = deferred<boolean>();
  apiMock.expectCheckCalibrationSupported(true);
  apiMock.mockApiClient.calibrate.expectCallWith().returns(promise);
  renderModal({
    // Note that in reality, scanner status would update as the scanner
    // calibrates, but the modal ignores it, so we don't bother mocking the
    // changes.
    scannerStatus: { ...fakeScannerStatus, state: 'ready_to_scan' },
  });

  userEvent.click(await screen.findByText('Calibrate'));

  screen.getByText('Calibrating…');

  resolve(true);

  await screen.findByText('Calibration succeeded!');
});

test('calibrate unsupported', async () => {
  apiMock.expectCheckCalibrationSupported(false);
  renderModal({
    scannerStatus: { ...fakeScannerStatus, state: 'ready_to_scan' },
  });

  await screen.findByText('Calibration not supported');
  userEvent.click(await screen.findByText('Cancel'));
});

test('calibrate error and cancel', async () => {
  const { promise, resolve } = deferred<boolean>();
  apiMock.expectCheckCalibrationSupported(true);
  apiMock.mockApiClient.calibrate.expectCallWith().returns(promise);
  const onCancel = jest.fn();
  renderModal({
    // Note that in reality, scanner status would update as the scanner
    // calibrates, but the modal ignores it, so we don't bother mocking the
    // changes.
    scannerStatus: { ...fakeScannerStatus, state: 'ready_to_scan' },
    onCancel,
  });

  userEvent.click(await screen.findByText('Calibrate'));

  screen.getByText('Calibrating…');

  resolve(false);

  await screen.findByText('Calibration failed!');

  userEvent.click(await screen.findByText('Cancel'));
  await waitFor(() => expect(onCancel).toHaveBeenCalled());
});

test('calibrate error and try again', async () => {
  const { promise, resolve } = deferred<boolean>();
  apiMock.expectCheckCalibrationSupported(true);
  apiMock.mockApiClient.calibrate.expectCallWith().returns(promise);
  renderModal({
    // Note that in reality, scanner status would update as the scanner
    // calibrates, but the modal ignores it, so we don't bother mocking the
    // changes.
    scannerStatus: { ...fakeScannerStatus, state: 'ready_to_scan' },
  });

  userEvent.click(await screen.findByText('Calibrate'));

  screen.getByText('Calibrating…');

  resolve(false);

  await screen.findByText('Calibration failed!');

  userEvent.click(await screen.findByText('Try again'));
  screen.getByRole('heading', { name: 'Calibrate Scanner' });
});

// This test won't actually fail, but it will cause the warning:
// "An update to CalibrateScannerModal inside a test was not wrapped in act(...)."
test('unmount during calibration (e.g. if election manager card removed)', async () => {
  const { promise, resolve } = deferred<boolean>();
  apiMock.expectCheckCalibrationSupported(true);
  apiMock.mockApiClient.calibrate.expectCallWith().returns(promise);
  const { unmount } = renderModal({
    scannerStatus: { ...fakeScannerStatus, state: 'ready_to_scan' },
  });

  userEvent.click(await screen.findByText('Calibrate'));

  screen.getByText('Calibrating…');

  unmount();

  resolve(true);
});
