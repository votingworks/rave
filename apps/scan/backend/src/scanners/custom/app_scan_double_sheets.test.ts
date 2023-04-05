import { AdjudicationReason } from '@votingworks/types';
import { ok } from '@votingworks/basics';
import { mocks } from '@votingworks/custom-scanner';
import {
  configureApp,
  expectStatus,
  mockInterpretation,
  waitForStatus,
} from '../../../test/helpers/shared_helpers';
import { SheetInterpretation } from '../../types';
import { ballotImages, withApp } from '../../../test/helpers/custom_helpers';

jest.setTimeout(20_000);
jest.mock('@votingworks/ballot-encoder', () => {
  return {
    ...jest.requireActual('@votingworks/ballot-encoder'),
    // to allow changing election definitions without changing the image fixtures
    // TODO: generate image fixtures from election definitions more easily
    // this election hash is for the famous names image fixtures
    sliceElectionHash: () => 'da81438d51136692b43c',
  };
});

const needsReviewInterpretation: SheetInterpretation = {
  type: 'NeedsReviewSheet',
  reasons: [{ type: AdjudicationReason.BlankBallot }],
};

test('insert second ballot before first ballot accept', async () => {
  await withApp(
    { delays: {} },
    async ({ apiClient, mockScanner, mockUsb, mockAuth }) => {
      await configureApp(apiClient, mockUsb, { mockAuth });

      mockScanner.getStatus.mockResolvedValue(ok(mocks.MOCK_READY_TO_SCAN));
      await waitForStatus(apiClient, { state: 'ready_to_scan' });

      mockScanner.scan.mockResolvedValue(ok(await ballotImages.completeBmd()));
      await apiClient.scanBallot();
      await expectStatus(apiClient, { state: 'scanning' });

      mockScanner.getStatus.mockResolvedValue(
        ok(mocks.MOCK_BOTH_SIDES_HAVE_PAPER)
      );
      await waitForStatus(apiClient, { state: 'both_sides_have_paper' });

      const interpretation: SheetInterpretation = {
        type: 'ValidSheet',
      };
      mockScanner.getStatus.mockResolvedValue(ok(mocks.MOCK_READY_TO_EJECT));
      await waitForStatus(apiClient, {
        state: 'ready_to_accept',
        interpretation,
      });

      await apiClient.acceptBallot();
      await waitForStatus(apiClient, { state: 'accepting', interpretation });

      mockScanner.getStatus.mockResolvedValue(ok(mocks.MOCK_NO_PAPER));
      await waitForStatus(apiClient, { state: 'no_paper', ballotsCounted: 1 });
    }
  );
});

test('insert second ballot while first ballot is accepting', async () => {
  await withApp(
    {
      delays: {
        DELAY_ACCEPTED_READY_FOR_NEXT_BALLOT: 1000,
        DELAY_ACCEPTED_RESET_TO_NO_PAPER: 2000,
      },
    },
    async ({ apiClient, mockScanner, interpreter, mockUsb, mockAuth }) => {
      await configureApp(apiClient, mockUsb, { mockAuth });

      mockScanner.getStatus.mockResolvedValue(ok(mocks.MOCK_READY_TO_SCAN));
      await waitForStatus(apiClient, { state: 'ready_to_scan' });

      const interpretation: SheetInterpretation = {
        type: 'ValidSheet',
      };
      mockInterpretation(interpreter, interpretation);

      mockScanner.scan.mockResolvedValue(ok(await ballotImages.completeBmd()));
      await apiClient.scanBallot();
      mockScanner.getStatus.mockResolvedValue(ok(mocks.MOCK_READY_TO_EJECT));
      await expectStatus(apiClient, { state: 'scanning' });
      await waitForStatus(apiClient, {
        state: 'ready_to_accept',
        interpretation,
      });
      await apiClient.acceptBallot();
      mockScanner.getStatus.mockResolvedValue(
        ok(mocks.MOCK_BOTH_SIDES_HAVE_PAPER)
      );

      await waitForStatus(apiClient, {
        state: 'accepted',
        interpretation,
        ballotsCounted: 1,
      });
      await waitForStatus(apiClient, {
        state: 'returning_to_rescan',
        ballotsCounted: 1,
      });
    }
  );
});

test('insert second ballot while first ballot needs review', async () => {
  await withApp(
    {},
    async ({ apiClient, mockScanner, interpreter, mockUsb, mockAuth }) => {
      await configureApp(apiClient, mockUsb, { mockAuth });

      mockScanner.getStatus.mockResolvedValue(ok(mocks.MOCK_READY_TO_SCAN));
      await waitForStatus(apiClient, { state: 'ready_to_scan' });

      const interpretation = needsReviewInterpretation;
      mockInterpretation(interpreter, interpretation);

      mockScanner.scan.mockResolvedValue(ok(await ballotImages.unmarkedHmpb()));
      await apiClient.scanBallot();
      await expectStatus(apiClient, { state: 'scanning' });

      mockScanner.getStatus.mockResolvedValue(ok(mocks.MOCK_READY_TO_EJECT));
      await waitForStatus(apiClient, { state: 'needs_review', interpretation });

      mockScanner.getStatus.mockResolvedValue(
        ok(mocks.MOCK_BOTH_SIDES_HAVE_PAPER)
      );
      await waitForStatus(apiClient, {
        state: 'both_sides_have_paper',
        interpretation,
      });

      mockScanner.getStatus.mockResolvedValue(ok(mocks.MOCK_READY_TO_EJECT));
      await waitForStatus(apiClient, { state: 'needs_review', interpretation });

      await apiClient.acceptBallot();
      await waitForStatus(apiClient, {
        state: 'accepting_after_review',
        interpretation,
      });

      mockScanner.getStatus.mockResolvedValue(ok(mocks.MOCK_NO_PAPER));
      await waitForStatus(apiClient, {
        state: 'accepted',
        interpretation,
        ballotsCounted: 1,
      });
    }
  );
});
