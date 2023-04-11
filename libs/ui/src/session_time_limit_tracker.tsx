/* istanbul ignore file */
import pluralize from 'pluralize';
import React, { useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import styled from 'styled-components';
import {
  DEFAULT_INACTIVE_SESSION_TIME_LIMIT_MINUTES,
  DEFAULT_OVERALL_SESSION_TIME_LIMIT_HOURS,
  DippedSmartCardAuth,
  InsertedSmartCardAuth,
  UnixTimestampInMilliseconds,
} from '@votingworks/types';

import { Button } from './button';
import { useNow } from './hooks/use_now';
import { Modal } from './modal';
import { Prose } from './prose';
import { Timer } from './timer';

const SECONDS_TO_WRAP_UP_AFTER_INACTIVE_SESSION_TIME_LIMIT = 60;
const SECONDS_AHEAD_OF_OVERALL_SESSION_TIME_LIMIT_TO_WARN = 15 * 60;

type AuthStatusWithSessionExpiry =
  | DippedSmartCardAuth.RemoveCard
  | DippedSmartCardAuth.LoggedIn
  | InsertedSmartCardAuth.LoggedIn;

function computeSecondsToSessionExpiry(
  authStatus: AuthStatusWithSessionExpiry,
  now: Date
): number {
  return Math.max(
    (new Date(authStatus.sessionExpiresAt).getTime() - now.getTime()) / 1000,
    0
  );
}

function shouldDisplayTimeLimitPrompt(
  authStatus: AuthStatusWithSessionExpiry,
  now: Date
): boolean {
  const secondsToSessionExpiry = computeSecondsToSessionExpiry(authStatus, now);
  return (
    // Despite looking like a condition for only the overall session time limit, this condition
    // also covers the inactive session time limit, since we trigger the logout for that limit by
    // bringing the session expiry up, even closer than
    // SECONDS_AHEAD_OF_OVERALL_SESSION_TIME_LIMIT_TO_WARN
    secondsToSessionExpiry <=
    SECONDS_AHEAD_OF_OVERALL_SESSION_TIME_LIMIT_TO_WARN
  );
}

interface SessionTimeLimitTrackerHelperProps {
  authStatus: AuthStatusWithSessionExpiry;
  logOut: () => void;
  updateSessionExpiry: (sessionExpiresAt: UnixTimestampInMilliseconds) => void;
}

/**
 * A helper for SessionTimeLimitTracker
 */
function SessionTimeLimitTrackerHelper({
  authStatus,
  logOut,
  updateSessionExpiry,
}: SessionTimeLimitTrackerHelperProps): JSX.Element | null {
  // TODO: Pull values from system settings
  const inactiveSessionTimeLimitMinutes =
    DEFAULT_INACTIVE_SESSION_TIME_LIMIT_MINUTES;
  const overallSessionTimeLimitHours = DEFAULT_OVERALL_SESSION_TIME_LIMIT_HOURS;

  const now = useNow().toJSDate();
  const [
    hasInactiveSessionTimeLimitBeenHit,
    setHasInactiveSessionTimeLimitBeenHit,
  ] = useState(false);
  const [isModalDismissed, setIsModalDismissed] = useState(false);

  function dismissModal() {
    setIsModalDismissed(true);
  }

  useIdleTimer({
    onIdle: () => {
      setHasInactiveSessionTimeLimitBeenHit(true);
      // Have the backend log out in SECONDS_TO_WRAP_UP_AFTER_INACTIVE_SESSION_TIME_LIMIT
      updateSessionExpiry(
        new Date().getTime() +
          SECONDS_TO_WRAP_UP_AFTER_INACTIVE_SESSION_TIME_LIMIT * 1000
      );
    },
    stopOnIdle: true,
    timeout: inactiveSessionTimeLimitMinutes * 60 * 1000,
  });

  if (shouldDisplayTimeLimitPrompt(authStatus, now) && !isModalDismissed) {
    return (
      <Modal
        actions={
          <React.Fragment>
            <Button variant="primary" onPress={logOut}>
              Lock Machine Now
            </Button>
            <Button onPress={dismissModal}>Dismiss</Button>
          </React.Fragment>
        }
        content={
          <Prose textCenter>
            <h1>Session Time Limit</h1>
            {hasInactiveSessionTimeLimitBeenHit ? (
              // Inactive session time limit
              <p>
                Your session has been inactive for{' '}
                {pluralize('minutes', inactiveSessionTimeLimitMinutes, true)}.
                <br />
                The machine will automatically lock in{' '}
                <Timer countDownTo={new Date(authStatus.sessionExpiresAt)} />.
              </p>
            ) : (
              // Overall session time limit
              <p>
                You are approaching the session time limit of{' '}
                {pluralize('hours', overallSessionTimeLimitHours, true)}.
                <br />
                The machine will automatically lock in{' '}
                <Timer countDownTo={new Date(authStatus.sessionExpiresAt)} />.
              </p>
            )}
            <p>
              Lock the machine now and reauthenticate
              <br />
              with your smart card to continue working.
            </p>
          </Prose>
        }
      />
    );
  }

  return null;
}

interface SessionTimeLimitTrackerProps {
  authStatus?:
    | DippedSmartCardAuth.AuthStatus
    | InsertedSmartCardAuth.AuthStatus;
  logOut: () => void;
  updateSessionExpiry: (sessionExpiresAt: UnixTimestampInMilliseconds) => void;
}

/**
 * Tracks inactive and overall session time, surfacing the relevant prompts as limits are
 * approached/hit
 */
export function SessionTimeLimitTracker({
  authStatus,
  logOut,
  updateSessionExpiry,
}: SessionTimeLimitTrackerProps): JSX.Element | null {
  if (
    authStatus?.status !== 'remove_card' &&
    authStatus?.status !== 'logged_in'
  ) {
    return null;
  }
  return (
    <SessionTimeLimitTrackerHelper
      authStatus={authStatus}
      logOut={logOut}
      updateSessionExpiry={updateSessionExpiry}
    />
  );
}

const Annotation = styled('span')`
  font-size: 0.75em;
`;

interface SessionTimeLimitTimerProps {
  authStatus?:
    | DippedSmartCardAuth.AuthStatus
    | InsertedSmartCardAuth.AuthStatus;
}

/**
 * Displays a count down timer to session expiry. Appears at the same time as the prompts surfaced
 * by SessionTimeLimitTracker.
 */
export function SessionTimeLimitTimer({
  authStatus,
}: SessionTimeLimitTimerProps): JSX.Element | null {
  const now = useNow().toJSDate();

  if (authStatus?.status !== 'logged_in') {
    return null;
  }
  if (shouldDisplayTimeLimitPrompt(authStatus, now)) {
    return (
      <span>
        <Annotation>Machine will automatically lock in</Annotation>{' '}
        <Timer countDownTo={new Date(authStatus.sessionExpiresAt)} />
      </span>
    );
  }
  return null;
}