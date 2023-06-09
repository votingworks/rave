import { DateTime } from 'luxon';
import {
  DEFAULT_OVERALL_SESSION_TIME_LIMIT_HOURS,
  OverallSessionTimeLimitHours,
} from '@votingworks/types';

/**
 * Config params for sessions
 */
export interface SessionConfig {
  overallSessionTimeLimitHours?: OverallSessionTimeLimitHours;
}

/**
 * Computes a session end time
 */
export function computeSessionEndTime(
  sessionConfig: SessionConfig,
  sessionStartTime = new Date()
): Date {
  const {
    overallSessionTimeLimitHours = DEFAULT_OVERALL_SESSION_TIME_LIMIT_HOURS,
  } = sessionConfig;

  return DateTime.fromJSDate(sessionStartTime)
    .plus({ hours: overallSessionTimeLimitHours })
    .toJSDate();
}
