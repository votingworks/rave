import MockDate from 'mockdate';
import { fakeLogger, LogEventId } from '@votingworks/logging';
import {
  fakeFileWriter,
  fakeKiosk,
  fakeUsbDrive,
} from '@votingworks/test-utils';
import React from 'react';
import { UsbDriveStatus, mockUsbDrive } from '@votingworks/ui';
import userEvent from '@testing-library/user-event';
import {
  fireEvent,
  screen,
  waitFor,
  within,
} from '../../test/react_testing_library';
import { renderInAppContext } from '../../test/render_in_app_context';
import { ExportElectionBallotPackageModalButton } from './export_election_ballot_package_modal_button';
import { ApiMock, createApiMock } from '../../test/helpers/api_mock';

let apiMock: ApiMock;

beforeEach(() => {
  MockDate.set(new Date(2023, 0, 1));

  apiMock = createApiMock();
  apiMock.expectGetSystemSettings();

  const mockKiosk = fakeKiosk();
  mockKiosk.getUsbDriveInfo.mockResolvedValue([fakeUsbDrive()]);
  const fileWriter = fakeFileWriter();
  mockKiosk.saveAs = jest.fn().mockResolvedValue(fileWriter);
  mockKiosk.writeFile = jest.fn().mockResolvedValue(fileWriter);
  window.kiosk = mockKiosk;
});

afterEach(() => {
  apiMock.assertComplete();
  delete window.kiosk;
});

const ballotPackagePath =
  'fake mount point/ballot-packages/choctaw-county_mock-general-election-choctaw-2020_6b99ddaab1__2023-01-01_00-00-00.zip';

test('Button renders properly when not clicked', () => {
  const { queryByTestId } = renderInAppContext(
    <ExportElectionBallotPackageModalButton />,
    {
      apiMock,
    }
  );

  screen.getButton('Save Ballot Package');
  expect(queryByTestId('modal')).toBeNull();
});

test.each<{
  usbStatus: UsbDriveStatus;
}>([
  { usbStatus: 'absent' },
  { usbStatus: 'ejected' },
  { usbStatus: 'bad_format' },
])(
  'Modal renders insert usb screen appropriately for status $usbStatus',
  async ({ usbStatus }) => {
    const { getByText, queryAllByText, queryAllByAltText, queryAllByTestId } =
      renderInAppContext(<ExportElectionBallotPackageModalButton />, {
        usbDrive: mockUsbDrive(usbStatus),
        apiMock,
      });
    fireEvent.click(getByText('Save Ballot Package'));
    await waitFor(() => getByText('No USB Drive Detected'));
    expect(queryAllByAltText('Insert USB Image')).toHaveLength(1);
    expect(queryAllByTestId('modal')).toHaveLength(1);
    expect(
      queryAllByText(
        'Please insert a USB drive in order to save the ballot configuration.'
      )
    ).toHaveLength(1);

    fireEvent.click(getByText('Cancel'));
    expect(queryAllByTestId('modal')).toHaveLength(0);
  }
);

test('Modal renders export confirmation screen when usb detected and manual link works as expected', async () => {
  const logger = fakeLogger();
  renderInAppContext(<ExportElectionBallotPackageModalButton />, {
    usbDrive: mockUsbDrive('mounted'),
    logger,
    apiMock,
  });
  apiMock.expectWriteBallotPackageSignatureFile(ballotPackagePath);
  userEvent.click(
    await screen.findByRole('button', { name: 'Save Ballot Package' })
  );
  const modal = await screen.findByRole('alertdialog');
  within(modal).getByText('Save Ballot Package');
  within(modal).getByAltText('Insert USB Image');
  within(modal).getByText(
    /A zip archive will automatically be saved to the default location on the mounted USB drive./
  );
  within(modal).getByText(/Optionally, you may pick a custom save location./);

  fireEvent.click(within(modal).getByText('Custom'));
  await within(modal).findByText('Ballot Package Saved');
  expect(logger.log).toHaveBeenCalledWith(
    LogEventId.SaveBallotPackageInit,
    'election_manager'
  );
  expect(logger.log).toHaveBeenCalledWith(
    LogEventId.SaveBallotPackageComplete,
    'election_manager',
    expect.objectContaining({ disposition: 'success' })
  );

  fireEvent.click(within(modal).getByText('Close'));
  expect(screen.queryAllByTestId('modal')).toHaveLength(0);
});

test.each<{
  usbStatus: UsbDriveStatus;
}>([{ usbStatus: 'mounting' }, { usbStatus: 'ejecting' }])(
  'Modal renders loading screen when usb drive is $usbStatus',
  async ({ usbStatus }) => {
    const { queryAllByTestId, getByText } = renderInAppContext(
      <ExportElectionBallotPackageModalButton />,
      {
        usbDrive: mockUsbDrive(usbStatus),
        apiMock,
      }
    );
    fireEvent.click(screen.getButton('Save Ballot Package'));
    await waitFor(() => getByText('Loading'));

    expect(queryAllByTestId('modal')).toHaveLength(1);

    expect(screen.getButton('Cancel')).toBeDisabled();
  }
);

test('Modal renders error message appropriately', async () => {
  const logger = fakeLogger();
  window.kiosk!.saveAs = jest.fn().mockResolvedValue(undefined);
  const { queryAllByTestId, getByText, queryAllByText } = renderInAppContext(
    <ExportElectionBallotPackageModalButton />,
    {
      apiMock,
      usbDrive: mockUsbDrive('mounted'),
      logger,
    }
  );
  fireEvent.click(getByText('Save Ballot Package'));
  await waitFor(() => getByText('Save'));

  fireEvent.click(getByText('Custom'));

  await waitFor(() => getByText('Failed to Save Ballot Package'));
  expect(queryAllByTestId('modal')).toHaveLength(1);
  expect(queryAllByText(/An error occurred:/)).toHaveLength(1);
  expect(queryAllByText(/could not save; no file was chosen/)).toHaveLength(1);

  fireEvent.click(getByText('Close'));
  expect(queryAllByTestId('modal')).toHaveLength(0);
  expect(logger.log).toHaveBeenCalledWith(
    LogEventId.SaveBallotPackageInit,
    'election_manager'
  );
  expect(logger.log).toHaveBeenCalledWith(
    LogEventId.SaveBallotPackageComplete,
    'election_manager',
    expect.objectContaining({ disposition: 'failure' })
  );
});

test('Modal renders renders loading message while rendering ballots appropriately', async () => {
  const usbDrive = mockUsbDrive('mounted');
  const { queryAllByTestId, getByText, queryByText, getByRole } =
    renderInAppContext(<ExportElectionBallotPackageModalButton />, {
      apiMock,
      usbDrive,
    });
  apiMock.expectWriteBallotPackageSignatureFile(ballotPackagePath);
  fireEvent.click(getByText('Save Ballot Package'));
  await waitFor(() => getByText('Save'));
  userEvent.click(getByRole('button', { name: /Save/ }));

  await waitFor(() => screen.findByText('Ballot Package Saved'));
  expect(window.kiosk!.writeFile).toHaveBeenCalledTimes(1);
  expect(window.kiosk!.makeDirectory).toHaveBeenCalledTimes(1);

  expect(queryAllByTestId('modal')).toHaveLength(1);
  expect(
    queryByText(
      'You may now eject the USB drive. Use the saved ballot package on this USB drive to configure VxScan or VxCentralScan.'
    )
  ).toBeInTheDocument();

  expect(queryByText('Eject USB')).toBeInTheDocument();
  fireEvent.click(getByText('Eject USB'));
  expect(usbDrive.eject).toHaveBeenCalledTimes(1);

  fireEvent.click(getByText('Close'));
  expect(queryAllByTestId('modal')).toHaveLength(0);
});
