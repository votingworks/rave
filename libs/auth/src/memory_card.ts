import { z } from 'zod';
import { throwIllegalValue } from '@votingworks/basics';
import {
  CardSummaryReady,
  ElectionHash,
  safeParseJson,
  User,
  UserRole,
  UserRoleSchema,
} from '@votingworks/types';

/**
 * The frequency with which we poll the memory card summary
 */
export const CARD_POLLING_INTERVAL_MS = 100;

interface CardData {
  readonly t: UserRole;
}

const CardDataSchema = z.object({
  t: UserRoleSchema,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CardDataSchemaTypeCheck: z.ZodSchema<CardData> = CardDataSchema;

/** The representation of a system administrator on a memory card */
export interface SystemAdministratorCardData extends CardData {
  readonly t: 'system_administrator';
  /** PIN */
  readonly p: string;
}

const SystemAdministratorCardDataSchema: z.ZodSchema<SystemAdministratorCardData> =
  CardDataSchema.extend({
    t: z.literal('system_administrator'),
    p: z.string(),
  });

/** The representation of an election manager on a memory card */
export interface ElectionManagerCardData extends CardData {
  readonly t: 'election_manager';
  /** Election hash */
  readonly h: string;
  /** PIN */
  readonly p: string;
}

const ElectionManagerCardDataSchema: z.ZodSchema<ElectionManagerCardData> =
  CardDataSchema.extend({
    t: z.literal('election_manager'),
    h: ElectionHash,
    p: z.string(),
  });

/** The representation of a poll worker on a memory card */
export interface PollWorkerCardData extends CardData {
  readonly t: 'poll_worker';
  /** Election hash */
  readonly h: string;
}

const PollWorkerCardDataSchema: z.ZodSchema<PollWorkerCardData> =
  CardDataSchema.extend({
    t: z.literal('poll_worker'),
    h: ElectionHash,
  });

type AnyCardData =
  | SystemAdministratorCardData
  | ElectionManagerCardData
  | PollWorkerCardData;

const AnyCardDataSchema: z.ZodSchema<AnyCardData> = z.union([
  PollWorkerCardDataSchema,
  ElectionManagerCardDataSchema,
  SystemAdministratorCardDataSchema,
]);

/**
 * Parses user data from a memory card summary
 */
export function parseUserDataFromCardSummary(cardSummary: CardSummaryReady): {
  user?: User;
  pin?: string;
} {
  if (!cardSummary.shortValue) {
    return {};
  }

  const cardData = safeParseJson(
    cardSummary.shortValue,
    AnyCardDataSchema
  ).ok();
  if (!cardData) {
    return {};
  }

  switch (cardData.t) {
    case 'system_administrator':
      return {
        user: { role: 'system_administrator' },
        pin: cardData.p,
      };
    case 'election_manager':
      return {
        user: { role: 'election_manager', electionHash: cardData.h },
        pin: cardData.p,
      };
    case 'poll_worker':
      return {
        user: { role: 'poll_worker', electionHash: cardData.h },
      };
    /* istanbul ignore next: Compile-time check for completeness */
    default:
      throwIllegalValue(cardData, 't');
  }
}