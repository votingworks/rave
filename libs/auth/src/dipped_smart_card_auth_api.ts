import { Result } from '@votingworks/basics';
import {
  DippedSmartCardAuth,
  ElectionManagerUser,
  OverallSessionTimeLimitHours,
  PollWorkerUser,
  SystemAdministratorUser,
  UnixTimestampInMilliseconds,
} from '@votingworks/types';

/**
 * The API for a dipped smart card auth instance, "dipped" meaning that the card needs to be
 * inserted and removed from the card reader for the user to be authenticated
 */
export interface DippedSmartCardAuthApi {
  getAuthStatus(
    machineState: DippedSmartCardAuthMachineState
  ): Promise<DippedSmartCardAuth.AuthStatus>;

  checkPin(
    machineState: DippedSmartCardAuthMachineState,
    input: { pin: string }
  ): Promise<void>;
  logOut(machineState: DippedSmartCardAuthMachineState): Promise<void>;
  updateSessionExpiry(
    machineState: DippedSmartCardAuthMachineState,
    input: { sessionExpiresAt: UnixTimestampInMilliseconds }
  ): Promise<void>;

  programCard(
    machineState: DippedSmartCardAuthMachineState,
    input:
      | { userRole: SystemAdministratorUser['role'] }
      | { userRole: ElectionManagerUser['role']; electionData: string }
      | { userRole: PollWorkerUser['role'] }
  ): Promise<Result<{ pin?: string }, Error>>;
  unprogramCard(
    machineState: DippedSmartCardAuthMachineState
  ): Promise<Result<void, Error>>;
}

/**
 * Configuration parameters for a dipped smart card auth instance
 */
export interface DippedSmartCardAuthConfig {
  allowElectionManagersToAccessUnconfiguredMachines?: boolean;
}

/**
 * Machine state that the consumer is responsible for providing
 */
export interface DippedSmartCardAuthMachineState {
  arePollWorkerCardPinsEnabled?: boolean;
  electionHash?: string;
  jurisdiction?: string;
  numIncorrectPinAttemptsAllowedBeforeCardLockout?: number;
  overallSessionTimeLimitHours?: OverallSessionTimeLimitHours;
  startingCardLockoutDurationSeconds?: number;
}
