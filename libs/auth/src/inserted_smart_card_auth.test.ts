import { Buffer } from 'buffer';
import { z } from 'zod';
import { err, ok } from '@votingworks/basics';
import {
  electionSample2Definition,
  electionSampleDefinition,
} from '@votingworks/fixtures';
import {
  fakeLogger,
  LogDispositionStandardTypes,
  LogEventId,
  Logger,
} from '@votingworks/logging';
import {
  fakeCardlessVoterUser,
  fakeElectionManagerUser,
  fakePollWorkerUser,
  fakeSystemAdministratorUser,
  mockOf,
} from '@votingworks/test-utils';
import {
  ElectionSchema,
  InsertedSmartCardAuth as InsertedSmartCardAuthTypes,
} from '@votingworks/types';
import {
  BooleanEnvironmentVariableName,
  generatePin,
  isFeatureFlagEnabled,
} from '@votingworks/utils';

import { buildMockCard, MockCard, mockCardAssertComplete } from '../test/utils';
import { CardDetails, CardStatus } from './card';
import { DippedSmartCardAuthMachineState } from './dipped_smart_card_auth_api';
import { InsertedSmartCardAuth } from './inserted_smart_card_auth';
import {
  InsertedSmartCardAuthConfig,
  InsertedSmartCardAuthMachineState,
} from './inserted_smart_card_auth_api';

jest.mock('@votingworks/utils', (): typeof import('@votingworks/utils') => ({
  ...jest.requireActual('@votingworks/utils'),
  generatePin: jest.fn(),
  isFeatureFlagEnabled: jest.fn(),
}));

const pin = '123456';
const wrongPin = '654321';

let mockCard: MockCard;
let mockLogger: Logger;

beforeEach(() => {
  mockOf(generatePin).mockImplementation(() => pin);
  mockOf(isFeatureFlagEnabled).mockImplementation(() => false);

  mockCard = buildMockCard();
  mockLogger = fakeLogger();
});

afterEach(() => {
  mockCardAssertComplete(mockCard);

  // Remove all mock implementations
  jest.resetAllMocks();
});

const jurisdiction = 'st.jurisdiction';
const otherJurisdiction = 'st.other-jurisdiction';
const { election, electionData, electionHash } = electionSampleDefinition;
const otherElectionHash = electionSample2Definition.electionHash;
const defaultConfig: InsertedSmartCardAuthConfig = {};
const defaultMachineState: InsertedSmartCardAuthMachineState = {
  electionHash,
  jurisdiction,
};
const systemAdministratorUser = fakeSystemAdministratorUser();
const electionManagerUser = fakeElectionManagerUser({ electionHash });
const pollWorkerUser = fakePollWorkerUser({ electionHash });
const cardlessVoterUser = fakeCardlessVoterUser();

function mockCardStatus(cardStatus: CardStatus) {
  mockCard.getCardStatus.expectRepeatedCallsWith().resolves(cardStatus);
}

async function logInAsElectionManager(auth: InsertedSmartCardAuth) {
  mockCardStatus({
    status: 'ready',
    cardDetails: {
      jurisdiction,
      user: electionManagerUser,
    },
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'checking_pin',
    user: electionManagerUser,
  });
  mockCard.checkPin.expectCallWith(pin).resolves({ response: 'correct' });
  await auth.checkPin(defaultMachineState, { pin });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: electionManagerUser,
  });
  mockOf(mockLogger.log).mockClear();
}

async function logInAsPollWorker(auth: InsertedSmartCardAuth) {
  mockCardStatus({
    status: 'ready',
    cardDetails: {
      jurisdiction,
      user: pollWorkerUser,
      hasPin: false,
    },
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: pollWorkerUser,
  });
  mockOf(mockLogger.log).mockClear();
}

test.each<{
  description: string;
  cardStatus: CardStatus;
  expectedAuthStatus: InsertedSmartCardAuthTypes.AuthStatus;
  expectedLogOnInsertion?: Parameters<Logger['log']>;
  expectedLogOnRemoval?: Parameters<Logger['log']>;
}>([
  {
    description: 'unknown error',
    cardStatus: { status: 'unknown_error' },
    expectedAuthStatus: { status: 'logged_out', reason: 'no_card' },
  },
  {
    description: 'card error',
    cardStatus: { status: 'card_error' },
    expectedAuthStatus: { status: 'logged_out', reason: 'card_error' },
    expectedLogOnInsertion: [
      LogEventId.AuthLogin,
      'unknown',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User failed login.',
        reason: 'card_error',
      },
    ],
  },
  {
    description: 'canceling PIN entry',
    cardStatus: {
      status: 'ready',
      cardDetails: {
        jurisdiction,
        user: systemAdministratorUser,
      },
    },
    expectedAuthStatus: {
      status: 'checking_pin',
      user: systemAdministratorUser,
    },
    expectedLogOnRemoval: [
      LogEventId.AuthPinEntry,
      'system_administrator',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User canceled PIN entry.',
      },
    ],
  },
])(
  'Card insertions and removals - $description',
  async ({
    cardStatus,
    expectedAuthStatus,
    expectedLogOnInsertion,
    expectedLogOnRemoval,
  }) => {
    const auth = new InsertedSmartCardAuth({
      card: mockCard,
      config: defaultConfig,
      logger: mockLogger,
    });

    mockCardStatus({ status: 'no_card' });
    expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
      status: 'logged_out',
      reason: 'no_card',
    });

    mockCardStatus(cardStatus);
    expect(await auth.getAuthStatus(defaultMachineState)).toEqual(
      expectedAuthStatus
    );
    if (expectedLogOnInsertion) {
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockLogger.log).toHaveBeenNthCalledWith(
        1,
        ...expectedLogOnInsertion
      );
    }

    mockCardStatus({ status: 'no_card' });
    expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
      status: 'logged_out',
      reason: 'no_card',
    });
    if (expectedLogOnRemoval) {
      const logIndex = expectedLogOnInsertion ? 2 : 1;
      expect(mockLogger.log).toHaveBeenCalledTimes(logIndex);
      expect(mockLogger.log).toHaveBeenNthCalledWith(
        logIndex,
        ...expectedLogOnRemoval
      );
    }
  }
);

test.each<{
  description: string;
  machineState: DippedSmartCardAuthMachineState;
  cardDetails: CardDetails;
}>([
  {
    description: 'system administrator card',
    machineState: defaultMachineState,
    cardDetails: {
      jurisdiction,
      user: systemAdministratorUser,
    },
  },
  {
    description: 'election manager card',
    machineState: defaultMachineState,
    cardDetails: {
      jurisdiction,
      user: electionManagerUser,
    },
  },
  {
    description: 'poll worker card with PIN',
    machineState: {
      ...defaultMachineState,
      arePollWorkerCardPinsEnabled: true,
    },
    cardDetails: {
      jurisdiction,
      user: pollWorkerUser,
      hasPin: true,
    },
  },
])(
  'Login and logout using card with PIN - $description',
  async ({ machineState, cardDetails }) => {
    const auth = new InsertedSmartCardAuth({
      card: mockCard,
      config: defaultConfig,
      logger: mockLogger,
    });
    const { user } = cardDetails;

    mockCardStatus({ status: 'ready', cardDetails });
    expect(await auth.getAuthStatus(machineState)).toEqual({
      status: 'checking_pin',
      user,
    });

    mockCard.checkPin
      .expectCallWith(wrongPin)
      .resolves({ response: 'incorrect', numIncorrectPinAttempts: 1 });
    await auth.checkPin(machineState, { pin: wrongPin });
    expect(await auth.getAuthStatus(machineState)).toEqual({
      status: 'checking_pin',
      user,
      wrongPinEnteredAt: expect.any(Number),
    });
    expect(mockLogger.log).toHaveBeenCalledTimes(1);
    expect(mockLogger.log).toHaveBeenNthCalledWith(
      1,
      LogEventId.AuthPinEntry,
      user.role,
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User entered incorrect PIN.',
      }
    );

    mockCard.checkPin.expectCallWith(pin).resolves({ response: 'correct' });
    await auth.checkPin(machineState, { pin });
    expect(await auth.getAuthStatus(machineState)).toEqual({
      status: 'logged_in',
      user,
    });
    expect(mockLogger.log).toHaveBeenCalledTimes(3);
    expect(mockLogger.log).toHaveBeenNthCalledWith(
      2,
      LogEventId.AuthPinEntry,
      user.role,
      {
        disposition: LogDispositionStandardTypes.Success,
        message: 'User entered correct PIN.',
      }
    );
    expect(mockLogger.log).toHaveBeenNthCalledWith(
      3,
      LogEventId.AuthLogin,
      user.role,
      {
        disposition: LogDispositionStandardTypes.Success,
        message: 'User logged in.',
      }
    );

    mockCardStatus({ status: 'no_card' });
    expect(await auth.getAuthStatus(machineState)).toEqual({
      status: 'logged_out',
      reason: 'no_card',
    });
    expect(mockLogger.log).toHaveBeenCalledTimes(4);
    expect(mockLogger.log).toHaveBeenNthCalledWith(
      4,
      LogEventId.AuthLogout,
      user.role,
      {
        disposition: LogDispositionStandardTypes.Success,
        message: 'User logged out.',
      }
    );
  }
);

test('Login and logout using card without PIN', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCardStatus({
    status: 'ready',
    cardDetails: {
      jurisdiction,
      user: pollWorkerUser,
      hasPin: false,
    },
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: pollWorkerUser,
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(1);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    1,
    LogEventId.AuthLogin,
    'poll_worker',
    {
      disposition: LogDispositionStandardTypes.Success,
      message: 'User logged in.',
    }
  );

  mockCardStatus({ status: 'no_card' });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_out',
    reason: 'no_card',
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(2);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    2,
    LogEventId.AuthLogout,
    'poll_worker',
    {
      disposition: LogDispositionStandardTypes.Success,
      message: 'User logged out.',
    }
  );
});

test('Card lockout', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCardStatus({
    status: 'ready',
    cardDetails: {
      jurisdiction,
      numIncorrectPinAttempts: 4,
      user: electionManagerUser,
    },
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'checking_pin',
    user: electionManagerUser,
  });

  mockCard.checkPin
    .expectCallWith(wrongPin)
    .resolves({ response: 'incorrect', numIncorrectPinAttempts: 5 });
  await auth.checkPin(defaultMachineState, { pin: wrongPin });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'checking_pin',
    user: electionManagerUser,
    lockedOutUntil: expect.any(Number),
    wrongPinEnteredAt: expect.any(Number),
  });

  mockCardStatus({ status: 'no_card' });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_out',
    reason: 'no_card',
  });

  // Re-insert locked card
  mockCardStatus({
    status: 'ready',
    cardDetails: {
      jurisdiction,
      numIncorrectPinAttempts: 5,
      user: electionManagerUser,
    },
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'checking_pin',
    user: electionManagerUser,
    lockedOutUntil: expect.any(Number),
  });

  // Expect checkPin call to be ignored when locked out
  await auth.checkPin(defaultMachineState, { pin });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'checking_pin',
    user: electionManagerUser,
    lockedOutUntil: expect.any(Number),
  });
});

test.each<{
  description: string;
  config: InsertedSmartCardAuthConfig;
  machineState: InsertedSmartCardAuthMachineState;
  cardDetails?: CardDetails;
  expectedAuthStatus: InsertedSmartCardAuthTypes.AuthStatus;
  expectedLog?: Parameters<Logger['log']>;
}>([
  {
    description: 'invalid user on card',
    config: defaultConfig,
    machineState: defaultMachineState,
    cardDetails: undefined,
    expectedAuthStatus: {
      status: 'logged_out',
      reason: 'invalid_user_on_card',
    },
    expectedLog: [
      LogEventId.AuthLogin,
      'unknown',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User failed login.',
        reason: 'invalid_user_on_card',
      },
    ],
  },
  {
    description: 'wrong jurisdiction',
    config: defaultConfig,
    machineState: defaultMachineState,
    cardDetails: {
      jurisdiction: otherJurisdiction,
      user: systemAdministratorUser,
    },
    expectedAuthStatus: {
      status: 'logged_out',
      reason: 'invalid_user_on_card',
      cardUserRole: 'system_administrator',
    },
    expectedLog: [
      LogEventId.AuthLogin,
      'system_administrator',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User failed login.',
        reason: 'invalid_user_on_card',
      },
    ],
  },
  {
    description: 'skips jurisdiction validation if no machine jurisdiction',
    config: defaultConfig,
    machineState: { ...defaultMachineState, jurisdiction: undefined },
    cardDetails: {
      jurisdiction,
      user: systemAdministratorUser,
    },
    expectedAuthStatus: {
      status: 'checking_pin',
      user: systemAdministratorUser,
    },
  },
  {
    description: 'election manager can access unconfigured machine',
    config: defaultConfig,
    machineState: { ...defaultMachineState, electionHash: undefined },
    cardDetails: {
      jurisdiction,
      user: electionManagerUser,
    },
    expectedAuthStatus: {
      status: 'checking_pin',
      user: electionManagerUser,
    },
  },
  {
    description: 'poll worker cannot access unconfigured machine',
    config: defaultConfig,
    machineState: { ...defaultMachineState, electionHash: undefined },
    cardDetails: {
      jurisdiction,
      user: pollWorkerUser,
      hasPin: false,
    },
    expectedAuthStatus: {
      status: 'logged_out',
      reason: 'machine_not_configured',
      cardUserRole: 'poll_worker',
    },
    expectedLog: [
      LogEventId.AuthLogin,
      'poll_worker',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User failed login.',
        reason: 'machine_not_configured',
      },
    ],
  },
  {
    description: 'election manager card with mismatched election hash',
    config: defaultConfig,
    machineState: defaultMachineState,
    cardDetails: {
      jurisdiction,
      user: { ...electionManagerUser, electionHash: otherElectionHash },
    },
    expectedAuthStatus: {
      status: 'logged_out',
      reason: 'election_manager_wrong_election',
      cardUserRole: 'election_manager',
    },
    expectedLog: [
      LogEventId.AuthLogin,
      'election_manager',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User failed login.',
        reason: 'election_manager_wrong_election',
      },
    ],
  },
  {
    description:
      'election manager card with mismatched election hash, ' +
      'allowElectionManagersToAccessMachinesConfiguredForOtherElections = true',
    config: {
      ...defaultConfig,
      allowElectionManagersToAccessMachinesConfiguredForOtherElections: true,
    },
    machineState: defaultMachineState,
    cardDetails: {
      jurisdiction,
      user: { ...electionManagerUser, electionHash: otherElectionHash },
    },
    expectedAuthStatus: {
      status: 'checking_pin',
      user: { ...electionManagerUser, electionHash: otherElectionHash },
    },
  },
  {
    description: 'poll worker card with mismatched election hash',
    config: defaultConfig,
    machineState: defaultMachineState,
    cardDetails: {
      jurisdiction,
      user: { ...pollWorkerUser, electionHash: otherElectionHash },
      hasPin: false,
    },
    expectedAuthStatus: {
      status: 'logged_out',
      reason: 'poll_worker_wrong_election',
      cardUserRole: 'poll_worker',
    },
    expectedLog: [
      LogEventId.AuthLogin,
      'poll_worker',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User failed login.',
        reason: 'poll_worker_wrong_election',
      },
    ],
  },
  {
    description:
      'poll worker card without PIN when poll worker card PINs are enabled',
    config: defaultConfig,
    machineState: {
      ...defaultMachineState,
      arePollWorkerCardPinsEnabled: true,
    },
    cardDetails: {
      jurisdiction,
      user: pollWorkerUser,
      hasPin: false,
    },
    expectedAuthStatus: {
      status: 'logged_out',
      reason: 'invalid_user_on_card',
      cardUserRole: 'poll_worker',
    },
    expectedLog: [
      LogEventId.AuthLogin,
      'poll_worker',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User failed login.',
        reason: 'invalid_user_on_card',
      },
    ],
  },
  {
    description:
      'poll worker card with PIN when poll worker card PINs are not enabled',
    config: defaultConfig,
    machineState: defaultMachineState,
    cardDetails: {
      jurisdiction,
      user: pollWorkerUser,
      hasPin: true,
    },
    expectedAuthStatus: {
      status: 'logged_out',
      reason: 'invalid_user_on_card',
      cardUserRole: 'poll_worker',
    },
    expectedLog: [
      LogEventId.AuthLogin,
      'poll_worker',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'User failed login.',
        reason: 'invalid_user_on_card',
      },
    ],
  },
])(
  'Card validation - $description',
  async ({
    config,
    machineState,
    cardDetails,
    expectedAuthStatus,
    expectedLog,
  }) => {
    const auth = new InsertedSmartCardAuth({
      card: mockCard,
      config,
      logger: mockLogger,
    });

    mockCardStatus({ status: 'ready', cardDetails });
    expect(await auth.getAuthStatus(machineState)).toEqual(expectedAuthStatus);
    if (expectedLog) {
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockLogger.log).toHaveBeenNthCalledWith(1, ...expectedLog);
    }
  }
);

test('Cardless voter sessions - ending preemptively', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: { ...defaultConfig, allowCardlessVoterSessions: true },
    logger: mockLogger,
  });

  await logInAsPollWorker(auth);

  // Start cardless voter session
  await auth.startCardlessVoterSession(defaultMachineState, {
    ballotStyleId: cardlessVoterUser.ballotStyleId,
    precinctId: cardlessVoterUser.precinctId,
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: pollWorkerUser,
    cardlessVoterUser,
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(1);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    1,
    LogEventId.AuthLogin,
    'cardless_voter',
    {
      disposition: LogDispositionStandardTypes.Success,
      message: 'Cardless voter session started.',
    }
  );

  // End cardless voter session before removing poll worker card
  await auth.endCardlessVoterSession();
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: pollWorkerUser,
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(2);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    2,
    LogEventId.AuthLogout,
    'cardless_voter',
    {
      disposition: LogDispositionStandardTypes.Success,
      message: 'Cardless voter session ended.',
    }
  );
});

test('Cardless voter sessions - end-to-end', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: { ...defaultConfig, allowCardlessVoterSessions: true },
    logger: mockLogger,
  });

  await logInAsPollWorker(auth);

  // Start cardless voter session
  await auth.startCardlessVoterSession(defaultMachineState, {
    ballotStyleId: cardlessVoterUser.ballotStyleId,
    precinctId: cardlessVoterUser.precinctId,
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: pollWorkerUser,
    cardlessVoterUser,
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(1);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    1,
    LogEventId.AuthLogin,
    'cardless_voter',
    {
      disposition: LogDispositionStandardTypes.Success,
      message: 'Cardless voter session started.',
    }
  );

  // Remove poll worker card, granting control to cardless voter
  mockCardStatus({ status: 'no_card' });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: cardlessVoterUser,
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(2);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    2,
    LogEventId.AuthLogout,
    'poll_worker',
    {
      disposition: LogDispositionStandardTypes.Success,
      message: 'User logged out.',
    }
  );

  // Insert poll worker card in the middle of cardless voter session
  mockCardStatus({
    status: 'ready',
    cardDetails: {
      jurisdiction,
      user: pollWorkerUser,
      hasPin: false,
    },
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: pollWorkerUser,
    cardlessVoterUser,
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(3);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    3,
    LogEventId.AuthLogin,
    'poll_worker',
    {
      disposition: LogDispositionStandardTypes.Success,
      message: 'User logged in.',
    }
  );

  // Re-remove poll worker card, granting control back to cardless voter
  mockCardStatus({ status: 'no_card' });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: cardlessVoterUser,
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(4);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    4,
    LogEventId.AuthLogout,
    'poll_worker',
    {
      disposition: LogDispositionStandardTypes.Success,
      message: 'User logged out.',
    }
  );

  // End cardless voter session
  await auth.endCardlessVoterSession();
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_out',
    reason: 'no_card',
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(5);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    5,
    LogEventId.AuthLogout,
    'cardless_voter',
    {
      disposition: LogDispositionStandardTypes.Success,
      message: 'Cardless voter session ended.',
    }
  );
});

test('Reading card data', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCard.readData
    .expectCallWith()
    .resolves(Buffer.from(electionData, 'utf-8'));
  expect(
    await auth.readCardData(defaultMachineState, { schema: ElectionSchema })
  ).toEqual(ok(election));

  mockCard.readData
    .expectCallWith()
    .resolves(Buffer.from(electionData, 'utf-8'));
  expect(await auth.readCardDataAsString()).toEqual(ok(electionData));
});

test('Reading card data as string', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCard.readData.expectCallWith().resolves(Buffer.from([]));
  expect(
    await auth.readCardData(defaultMachineState, { schema: ElectionSchema })
  ).toEqual(ok(undefined));

  mockCard.readData.expectCallWith().resolves(Buffer.from([]));
  expect(await auth.readCardDataAsString()).toEqual(ok(undefined));
});

test('Writing card data', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCard.writeData
    .expectCallWith(Buffer.from(JSON.stringify(election), 'utf-8'))
    .resolves();
  mockCard.readData
    .expectCallWith()
    .resolves(Buffer.from(JSON.stringify(election), 'utf-8'));
  expect(
    await auth.writeCardData(defaultMachineState, {
      data: election,
      schema: ElectionSchema,
    })
  ).toEqual(ok());
});

test('Clearing card data', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCard.clearData.expectCallWith().resolves();
  expect(await auth.clearCardData()).toEqual(ok());
});

test('Checking PIN error handling', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCardStatus({
    status: 'ready',
    cardDetails: {
      jurisdiction,
      user: electionManagerUser,
    },
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'checking_pin',
    user: electionManagerUser,
  });

  mockCard.checkPin.expectCallWith(pin).throws(new Error('Whoa!'));
  await auth.checkPin(defaultMachineState, { pin });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'checking_pin',
    user: electionManagerUser,
    error: true,
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(1);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    1,
    LogEventId.AuthPinEntry,
    'election_manager',
    {
      disposition: LogDispositionStandardTypes.Failure,
      message: 'Error checking PIN: Whoa!',
    }
  );

  // Check that "successfully" entering an incorrect PIN clears the error state
  mockCard.checkPin
    .expectCallWith(wrongPin)
    .resolves({ response: 'incorrect', numIncorrectPinAttempts: 1 });
  await auth.checkPin(defaultMachineState, { pin: wrongPin });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'checking_pin',
    user: electionManagerUser,
    wrongPinEnteredAt: expect.any(Number),
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(2);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    2,
    LogEventId.AuthPinEntry,
    'election_manager',
    {
      disposition: LogDispositionStandardTypes.Failure,
      message: 'User entered incorrect PIN.',
    }
  );

  // Check that wrong PIN entry state is maintained after an error
  mockCard.checkPin.expectCallWith(pin).throws(new Error('Whoa!'));
  await auth.checkPin(defaultMachineState, { pin });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'checking_pin',
    user: electionManagerUser,
    error: true,
    wrongPinEnteredAt: expect.any(Number),
  });
  expect(mockLogger.log).toHaveBeenCalledTimes(3);
  expect(mockLogger.log).toHaveBeenNthCalledWith(
    3,
    LogEventId.AuthPinEntry,
    'election_manager',
    {
      disposition: LogDispositionStandardTypes.Failure,
      message: 'Error checking PIN: Whoa!',
    }
  );

  mockCard.checkPin.expectCallWith(pin).resolves({ response: 'correct' });
  await auth.checkPin(defaultMachineState, { pin });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: electionManagerUser,
  });
});

test(
  'Attempting to check a PIN when not in PIN checking state, ' +
    'e.g. because someone removed their card right after entering their PIN',
  async () => {
    const auth = new InsertedSmartCardAuth({
      card: mockCard,
      config: defaultConfig,
      logger: mockLogger,
    });

    mockCardStatus({ status: 'no_card' });
    mockCard.checkPin
      .expectCallWith(pin)
      .throws(new Error('Whoa! Card no longer in reader'));
    await auth.checkPin(defaultMachineState, { pin });
    expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
      status: 'logged_out',
      reason: 'no_card',
    });
    expect(mockLogger.log).toHaveBeenCalledTimes(1);
    expect(mockLogger.log).toHaveBeenNthCalledWith(
      1,
      LogEventId.AuthPinEntry,
      'unknown',
      {
        disposition: LogDispositionStandardTypes.Failure,
        message: 'Error checking PIN: Whoa! Card no longer in reader',
      }
    );
  }
);

test('Attempting to start a cardless voter session when logged out', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: { ...defaultConfig, allowCardlessVoterSessions: true },
    logger: mockLogger,
  });

  mockCardStatus({ status: 'no_card' });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_out',
    reason: 'no_card',
  });

  await auth.startCardlessVoterSession(defaultMachineState, {
    ballotStyleId: cardlessVoterUser.ballotStyleId,
    precinctId: cardlessVoterUser.precinctId,
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_out',
    reason: 'no_card',
  });
});

test('Attempting to start a cardless voter session when not a poll worker', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: { ...defaultConfig, allowCardlessVoterSessions: true },
    logger: mockLogger,
  });

  await logInAsElectionManager(auth);

  await auth.startCardlessVoterSession(defaultMachineState, {
    ballotStyleId: cardlessVoterUser.ballotStyleId,
    precinctId: cardlessVoterUser.precinctId,
  });
  expect(await auth.getAuthStatus(defaultMachineState)).toEqual({
    status: 'logged_in',
    user: electionManagerUser,
  });
});

test('Attempting to start a cardless voter session when not allowed by config', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  await logInAsPollWorker(auth);

  await expect(
    auth.startCardlessVoterSession(defaultMachineState, {
      ballotStyleId: cardlessVoterUser.ballotStyleId,
      precinctId: cardlessVoterUser.precinctId,
    })
  ).rejects.toThrow();
  await expect(auth.endCardlessVoterSession()).rejects.toThrow();
});

test('Reading card data error handling', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCard.readData.expectCallWith().throws(new Error('Whoa!'));
  expect(
    await auth.readCardData(defaultMachineState, { schema: ElectionSchema })
  ).toEqual(err(new Error('Whoa!')));
});

test('Reading card data as string error handling', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCard.readData
    .expectCallWith()
    .resolves(Buffer.from(JSON.stringify({}), 'utf-8'));
  expect(
    await auth.readCardData(defaultMachineState, { schema: ElectionSchema })
  ).toEqual(err(expect.any(z.ZodError)));

  mockCard.readData.expectCallWith().throws(new Error('Whoa!'));
  expect(await auth.readCardDataAsString()).toEqual(err(new Error('Whoa!')));
});

test('Writing card data error handling', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCard.writeData
    .expectCallWith(Buffer.from(JSON.stringify(election), 'utf-8'))
    .throws(new Error('Whoa!'));
  expect(
    await auth.writeCardData(defaultMachineState, {
      data: election,
      schema: ElectionSchema,
    })
  ).toEqual(err(new Error('Whoa!')));

  mockCard.writeData
    .expectCallWith(Buffer.from(JSON.stringify(election), 'utf-8'))
    .resolves();
  mockCard.readData.expectCallWith().throws(new Error('Whoa!'));
  expect(
    await auth.writeCardData(defaultMachineState, {
      data: election,
      schema: ElectionSchema,
    })
  ).toEqual(err(new Error('Verification of write by reading data failed')));
});

test('Clearing card data error handling', async () => {
  const auth = new InsertedSmartCardAuth({
    card: mockCard,
    config: defaultConfig,
    logger: mockLogger,
  });

  mockCard.clearData.expectCallWith().throws(new Error('Whoa!'));
  expect(await auth.clearCardData()).toEqual(err(new Error('Whoa!')));
});

test.each<{
  description: string;
  machineState: DippedSmartCardAuthMachineState;
  cardDetails: CardDetails;
}>([
  {
    description: 'system administrator card',
    machineState: defaultMachineState,
    cardDetails: {
      jurisdiction,
      user: systemAdministratorUser,
    },
  },
  {
    description: 'election manager card',
    machineState: defaultMachineState,
    cardDetails: {
      jurisdiction,
      user: electionManagerUser,
    },
  },
  {
    description: 'poll worker card with PIN',
    machineState: {
      ...defaultMachineState,
      arePollWorkerCardPinsEnabled: true,
    },
    cardDetails: {
      jurisdiction,
      user: pollWorkerUser,
      hasPin: true,
    },
  },
])(
  'SKIP_PIN_ENTRY feature flag - $description',
  async ({ machineState, cardDetails }) => {
    mockOf(isFeatureFlagEnabled).mockImplementation(
      (flag) => flag === BooleanEnvironmentVariableName.SKIP_PIN_ENTRY
    );
    const auth = new InsertedSmartCardAuth({
      card: mockCard,
      config: defaultConfig,
      logger: mockLogger,
    });
    const { user } = cardDetails;

    mockCardStatus({ status: 'ready', cardDetails });
    expect(await auth.getAuthStatus(machineState)).toEqual({
      status: 'logged_in',
      user,
    });
  }
);