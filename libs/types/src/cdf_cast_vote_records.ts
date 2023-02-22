// This file is copied from ./cdf/cast-vote-records/index.ts and then manually
// extended to include VotingWorks specific fields. Fields can be added but
// should not be removed in order to stay within the CDF CastVoteRecords NIST
// specification.

/* eslint-disable */

import { z, ZodNull } from 'zod';

import check8601 from '@antongolub/iso8601';
import { BallotPageLayout, BallotPageLayoutSchema, SheetOf } from './hmpb';
import { Optional } from './generic';

const Iso8601Date = z
  .string()
  .refine(check8601, 'dates must be in ISO8601 format');

/**
 * Type for xsd:datetime values.
 */
export type DateTime = z.TypeOf<typeof Iso8601Date>;

/**
 * Schema for {@link DateTime}.
 */
export const DateTimeSchema = Iso8601Date;

/**
 * Type for xsd:date values.
 */
export type Date = z.TypeOf<typeof Iso8601Date>;

/**
 * Schema {@link Date}.
 */
export const DateSchema = Iso8601Date;

/**
 * A URI/URL.
 */
export type Uri = string;

/**
 * Schema for {@link Uri}.
 */
export const UriSchema = z.string();

/**
 * Byte data stored in a string.
 */
export type Byte = string;

/**
 * Schema for {@link Byte}.
 */
export const ByteSchema = z.string();

/**
 * An integer number, i.e. a whole number without fractional part.
 */
export type integer = number;

/**
 * Schema for {@link integer}.
 */
export const integerSchema = z.number().int();

/**
 * A proper fractional value, represented using fractional or decimal notation.
 */
export type FractionalNumber = string;

/**
 * Schema for {@link FractionalNumber}.
 */
export const FractionalNumberSchema: z.ZodSchema<FractionalNumber> = z
  .string()
  .regex(/([0-9]+\/[1-9]+[0-9]*)|(\.[0-9]+)/);

/**
 * Used in SelectionPosition::IsAllocable to indicate whether the SelectionPosition::NumberVotes should be allocated to the underlying contest option counter.
 */
export enum AllocationStatus {
  /**
   * To not allocate votes to the contest option's accumulator.
   */
  No = 'no',

  /**
   * When the decision to allocate votes is unknown, such as when the adjudication is needed.
   */
  Unknown = 'unknown',

  /**
   * To allocate votes to the contest option's accumulator.
   */
  Yes = 'yes',
}

/**
 * Schema for {@link AllocationStatus}.
 */
export const AllocationStatusSchema = z.nativeEnum(AllocationStatus);

/**
 * Used in CVRSnapshot::Status to identify the status of the CVR.
 */
export enum CVRStatus {
  /**
   * To indicate that the CVR needs to be adjudicated.
   */
  NeedsAdjudication = 'needs-adjudication',

  /**
   * Used in conjunction with CVRSnapshot::OtherStatus when no other value in this enumeration applies.
   */
  Other = 'other',
}

/**
 * Schema for {@link CVRStatus}.
 */
export const CVRStatusSchema = z.nativeEnum(CVRStatus);

/**
 * Used in CVRSnapshot::Type to indicate the type of snapshot.
 */
export enum CVRType {
  /**
   * Has been adjudicated.
   */
  Interpreted = 'interpreted',

  /**
   * After contest rules applied.
   */
  Modified = 'modified',

  /**
   * As scanned, no contest rules applied.
   */
  Original = 'original',
}

/**
 * Schema for {@link CVRType}.
 */
export const CVRTypeSchema = z.nativeEnum(CVRType);

/**
 * To identify the version of the CVR specification being used, i.e., version 1.0.0.  This will need to be updated for different versions of the specification.
 */
export enum CastVoteRecordVersion {
  /**
   * Fixed value for the version of this specification.
   */
  v1_0_0 = '1.0.0',
}

/**
 * Schema for {@link CastVoteRecordVersion}.
 */
export const CastVoteRecordVersionSchema = z.nativeEnum(CastVoteRecordVersion);

/**
 * Used in CVRContestSelection::Status to identify the status of a contest selection in the CVR.
 */
export enum ContestSelectionStatus {
  /**
   * To indicate that the contest selection was generated per contest rules.
   */
  GeneratedRules = 'generated-rules',

  /**
   * To indicate that the contest selection was invalidated by the generating device because of contest rules.
   */
  InvalidatedRules = 'invalidated-rules',

  /**
   * To indicate that the contest selection was flagged by the generating device for adjudication.
   */
  NeedsAdjudication = 'needs-adjudication',

  /**
   * Used in conjunction with CVRContestSelection::OtherStatus when no other value in this enumeration applies.
   */
  Other = 'other',
}

/**
 * Schema for {@link ContestSelectionStatus}.
 */
export const ContestSelectionStatusSchema = z.nativeEnum(
  ContestSelectionStatus
);

/**
 * Used in CVRContest::Status to identify the status of a contest in which contest selection(s) were made.
 */
export enum ContestStatus {
  /**
   * To indicate that the contest has been invalidated by the generating device because of contest rules.
   */
  InvalidatedRules = 'invalidated-rules',

  /**
   * For a CVRContest with no SelectionPosition, i.e. to specify the position contains no marks or other indications.
   */
  NotIndicated = 'not-indicated',

  /**
   * Used in conjunction with CVRContest::OtherStatus when no other value in this enumeration applies.
   */
  Other = 'other',

  /**
   * To indicate that the contest was overvoted.
   */
  Overvoted = 'overvoted',

  /**
   * To indicate that the contest was undervoted.
   */
  Undervoted = 'undervoted',
}

/**
 * Schema for {@link ContestStatus}.
 */
export const ContestStatusSchema = z.nativeEnum(ContestStatus);

/**
 * Used in Hash::Type to indicate the type of hash being used for an image file.
 */
export enum HashType {
  /**
   * To indicate that the MD6 message digest algorithm is being used.
   */
  Md6 = 'md6',

  /**
   * Used in conjunction with Hash::OtherType when no other value in this enumeration applies.
   */
  Other = 'other',

  /**
   * To indicate that the SHA 256-bit signature is being used.
   */
  Sha256 = 'sha-256',

  /**
   * To indicate that the SHA 512-bit (32-byte) signature is being used.
   */
  Sha512 = 'sha-512',
}

/**
 * Schema for {@link HashType}.
 */
export const HashTypeSchema = z.nativeEnum(HashType);

/**
 * Used in Code::Type to indicate the type of code/identifier being used.
 */
export enum IdentifierType {
  /**
   * To indicate that the identifier is a FIPS code.
   */
  Fips = 'fips',

  /**
   * To indicate that the identifier is from a local-level scheme, i.e., unique to a county or city.
   */
  LocalLevel = 'local-level',

  /**
   * To indicate that the identifier is from a national-level scheme other than FIPS or OCD-ID.
   */
  NationalLevel = 'national-level',

  /**
   * To indicate that the identifier is from the OCD-ID scheme.
   */
  OcdId = 'ocd-id',

  /**
   * Used in conjunction with Code::OtherType when no other value in this enumeration applies.
   */
  Other = 'other',

  /**
   * To indicate that the identifier is from a state-level scheme, i.e., unique to a particular state.
   */
  StateLevel = 'state-level',
}

/**
 * Schema for {@link IdentifierType}.
 */
export const IdentifierTypeSchema = z.nativeEnum(IdentifierType);

/**
 * Used in SelectionPosition::HasIndication to identify whether a selection indication is present.
 */
export enum IndicationStatus {
  /**
   * There is no selection indication.
   */
  No = 'no',

  /**
   * It is unknown whether there is a selection indication, e.g., used for ambiguous marks.
   */
  Unknown = 'unknown',

  /**
   * There is a selection indication present.
   */
  Yes = 'yes',
}

/**
 * Schema for {@link IndicationStatus}.
 */
export const IndicationStatusSchema = z.nativeEnum(IndicationStatus);

/**
 * Used in SelectionPosition::Status to identify the status of a selection indication.
 */
export enum PositionStatus {
  /**
   * Used if the indication was adjudicated.
   */
  Adjudicated = 'adjudicated',

  /**
   * Used if the indication was generated by the creating device per contest rules.
   */
  GeneratedRules = 'generated-rules',

  /**
   * Used if the indication was invalidated by the creating device because of contest rules.
   */
  InvalidatedRules = 'invalidated-rules',

  /**
   * Used in conjunction with SelectionPosition::OtherStatus when no other value in this enumeration applies.
   */
  Other = 'other',
}

/**
 * Schema for {@link PositionStatus}.
 */
export const PositionStatusSchema = z.nativeEnum(PositionStatus);

/**
 * Used in CastVoteRecordReport::ReportType to indicate the type of the CVR report.
 */
export enum ReportType {
  /**
   * To indicate that the report contains adjudications.
   */
  Adjudicated = 'adjudicated',

  /**
   * To indicate that the report is an aggregation of device reports.
   */
  Aggregated = 'aggregated',

  /**
   * To indicate that the report is an export from a device such as a scanner.
   */
  OriginatingDeviceExport = 'originating-device-export',

  /**
   * Used in conjunction with CastVoteRecordReport::OtherReportType when no other value in this enumeration applies.
   */
  Other = 'other',

  /**
   * To indicate that the report is the result of a ranked choice voting round.
   */
  RcvRound = 'rcv-round',
}

/**
 * Schema for {@link ReportType}.
 */
export const ReportTypeSchema = z.nativeEnum(ReportType);

/**
 * Used in GpUnit::Type to indicate a type of political geography.
 */
export enum ReportingUnitType {
  /**
   * To indicate a combined precinct.
   */
  CombinedPrecinct = 'combined-precinct',

  /**
   * Used in conjunction with GpUnit::OtherType when no other value in this enumeration applies.
   */
  Other = 'other',

  /**
   * To indicate a polling place.
   */
  PollingPlace = 'polling-place',

  /**
   * To indicate a precinct.
   */
  Precinct = 'precinct',

  /**
   * To indicate a split-precinct.
   */
  SplitPrecinct = 'split-precinct',

  /**
   * To indicate a vote-center.
   */
  VoteCenter = 'vote-center',
}

/**
 * Schema for {@link ReportingUnitType}.
 */
export const ReportingUnitTypeSchema = z.nativeEnum(ReportingUnitType);

/**
 * Used in Contest::VoteVariation to indicate the vote variation (vote method) used to tabulate the contest.
 */
export enum VoteVariation {
  /**
   * To indicate approval voting.
   */
  Approval = 'approval',

  /**
   * To indicate the borda count method.
   */
  Borda = 'borda',

  /**
   * To indicate cumulative voting.
   */
  Cumulative = 'cumulative',

  /**
   * To indicate majority voting.
   */
  Majority = 'majority',

  /**
   * To indicate the N of M voting method.
   */
  NOfM = 'n-of-m',

  /**
   * Used in conjunction with Contest::OtherVoteVariation when no other value in this enumeration applies.
   */
  Other = 'other',

  /**
   * To indicate plurality voting.
   */
  Plurality = 'plurality',

  /**
   * To indicate proportional voting.
   */
  Proportional = 'proportional',

  /**
   * To indicate range voting.
   */
  Range = 'range',

  /**
   * To indicate Ranked Choice Voting (RCV).
   */
  Rcv = 'rcv',

  /**
   * To indicate the super majority voting method.
   */
  SuperMajority = 'super-majority',
}

/**
 * Schema for {@link VoteVariation}.
 */
export const VoteVariationSchema = z.nativeEnum(VoteVariation);

/**
 * Annotation is used to record annotations made by one or more adjudicators.CVRSnapshot includes Annotation.
 */
export interface Annotation {
  readonly '@type': 'CVR.Annotation';

  /**
   * The name(s) of the adjudicator(s).
   */
  readonly AdjudicatorName?: readonly string[];

  /**
   * A message created by the adjudicator(s).
   */
  readonly Message?: readonly string[];

  /**
   * The date and time of the annotation.
   */
  readonly TimeStamp?: DateTime;
}

/**
 * Schema for {@link Annotation}.
 */
export const AnnotationSchema: z.ZodSchema<Annotation> = z.object({
  '@type': z.literal('CVR.Annotation'),
  AdjudicatorName: z.optional(z.array(z.string())),
  Message: z.optional(z.array(z.string())),
  TimeStamp: z.optional(DateTimeSchema),
});

/**
 * BallotMeasureContest is a subclass of Contest and is used to identify the type of contest as involving one or more ballot measures. It inherits attributes from Contest.
 */
export interface BallotMeasureContest {
  readonly '@id': string;

  readonly '@type': 'CVR.BallotMeasureContest';

  /**
   * An abbreviation associated with the contest.
   */
  readonly Abbreviation?: string;

  /**
   * A code or identifier used for this contest.
   */
  readonly Code?: readonly Code[];

  /**
   * Identifies the contest selections in the contest.
   */
  readonly ContestSelection: ReadonlyArray<
    | ContestSelection
    | PartySelection
    | BallotMeasureSelection
    | CandidateSelection
  >;

  /**
   * Title or name of the contest, e.g., "Governor" or "Question on Legalization of Gambling".
   */
  readonly Name?: string;

  /**
   * If VoteVariation is 'other', the vote variation for this contest.
   */
  readonly OtherVoteVariation?: string;

  /**
   * The vote variation for this contest, from the VoteVariation enumeration.
   */
  readonly VoteVariation?: VoteVariation;
}

/**
 * Schema for {@link BallotMeasureContest}.
 */
export const BallotMeasureContestSchema: z.ZodSchema<BallotMeasureContest> =
  z.object({
    '@id': z.string(),
    '@type': z.literal('CVR.BallotMeasureContest'),
    Abbreviation: z.optional(z.string()),
    Code: z.optional(
      z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
    ),
    ContestSelection: z
      .array(
        z.union([
          z.lazy(/* istanbul ignore next */ () => ContestSelectionSchema),
          z.lazy(/* istanbul ignore next */ () => PartySelectionSchema),
          z.lazy(/* istanbul ignore next */ () => BallotMeasureSelectionSchema),
          z.lazy(/* istanbul ignore next */ () => CandidateSelectionSchema),
        ])
      )
      .min(1),
    Name: z.optional(z.string()),
    OtherVoteVariation: z.optional(z.string()),
    VoteVariation: z.optional(
      z.lazy(/* istanbul ignore next */ () => VoteVariationSchema)
    ),
  });

/**
 * BallotMeasureSelection is a subclass of ContestSelection and is used for ballot measures.  The voter's selected response to the contest selection (e.g., &quot;yes&quot; or &quot;no&quot;) may be in English or other languages as utilized on the voter's ballot.
 */
export interface BallotMeasureSelection {
  readonly '@id': string;

  readonly '@type': 'CVR.BallotMeasureSelection';

  /**
   * Code used to identify the contest selection.
   */
  readonly Code?: readonly Code[];

  /**
   * The voter's selection, i.e., 'yes' or 'no', in English or in other languages as utilized on the voter's ballot.
   */
  readonly Selection: string;
}

/**
 * Schema for {@link BallotMeasureSelection}.
 */
export const BallotMeasureSelectionSchema: z.ZodSchema<BallotMeasureSelection> =
  z.object({
    '@id': z.string(),
    '@type': z.literal('CVR.BallotMeasureSelection'),
    Code: z.optional(
      z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
    ),
    Selection: z.string(),
  });

/**
 * CVR constitutes a cast vote record, generated by a ballot scanning device, containing indications of contests and contest options chosen by the voter, as well as other information for auditing and annotation purposes. Each sheet of a multi-page paper ballot is represented by an individual CVR, e.g., if all sheets of a 5-sheet ballot are scanned, 5 CVRs will be created.  CastVoteRecordReport includes multiple instances of CVR as applicable.
 */
export interface CVR {
  readonly '@type': 'CVR.CVR';

  /**
   * A unique identifier for this CVR, used to link the CVR with the corresponding audit record, e.g., a paper ballot.  This identifier may be impressed on the corresponding audit record as it is scanned, or otherwise associated with the corresponding ballot.
   */
  readonly BallotAuditId?: string;

  /**
   * An image of the ballot sheet created by the scanning device.
   */
  readonly BallotImage?: readonly ImageData[];

  /**
   * A unique identifier for the ballot (or sheet of a multi-sheet ballot) that this CVR represents, used if ballots are pre-marked with unique identifiers.  If provided, this number would be the same on all CVRs that represent individual sheets from the same multi-sheet ballot.  This identifier is not the same as one that may be impressed on the corresponding ballot as it is scanned or otherwise associated with the corresponding ballot; see the BallotAuditId attribute.
   */
  readonly BallotPrePrintedId?: string;

  /**
   * A unique number for the ballot (or sheet of a multi-sheet ballot) that this CVR represents, used if ballots are pre-marked with unique numbers.  If provided, this number would be the same on all CVRs that represent individual sheets from the same multi-sheet ballot.  This number is not the same as one that may be impressed on the corresponding ballot as it is scanned or otherwise associated with the corresponding ballot; see the BallotAuditId attribute.
   */
  readonly BallotSheetId?: string;

  /**
   * An identifier of the ballot style associated with the corresponding ballot.
   */
  readonly BallotStyleId?: string;

  /**
   * Identifies the smallest unit of geography associated with the corresponding ballot, typically a precinct or split-precinct.
   */
  readonly BallotStyleUnitId?: string;

  /**
   * The identifier for the batch that includes this CVR.
   */
  readonly BatchId?: string;

  /**
   * The sequence number of the corresponding paper ballot within a batch.
   */
  readonly BatchSequenceId?: integer;

  /**
   * Identifies the repeatable portion of the CVR that links to contest selections and related information.
   */
  readonly CVRSnapshot: readonly CVRSnapshot[];

  /**
   * Identifies the device that created the CVR.
   */
  readonly CreatingDeviceId?: string;

  /**
   * Identifies the snapshot that is currently tabulatable.
   */
  readonly CurrentSnapshotId: string;

  /**
   * Used to identify an election with which the CVR is associated.
   */
  readonly ElectionId: string;

  /**
   * Identifies the party associated with a CVR, typically for partisan primaries.
   */
  readonly PartyIds?: readonly string[];

  /**
   * The sequence number for this CVR. This represents the ordinal number that this CVR was processed by the tabulating device.
   */
  readonly UniqueId?: string;

  /**
   * Indicates whether a ballot is absentee, precinct, or provisional
   */
  readonly vxBallotType: 'absentee' | 'provisional' | 'standard';

  /**
   * @deprecated Use to include the layout data of the ballot as scanned.
   * Deprecated as we will move to including these as separate files.
   */
  readonly vxLayouts?: SheetOf<BallotPageLayout | null>;
}

/**
 * Schema for {@link CVR}.
 */
export const CVRSchema: z.ZodSchema<CVR> = z.object({
  '@type': z.literal('CVR.CVR'),
  BallotAuditId: z.optional(z.string()),
  BallotImage: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => ImageDataSchema))
  ),
  BallotPrePrintedId: z.optional(z.string()),
  BallotSheetId: z.optional(z.string()),
  BallotStyleId: z.optional(z.string()),
  BallotStyleUnitId: z.optional(z.string()),
  BatchId: z.optional(z.string()),
  BatchSequenceId: z.optional(integerSchema),
  CVRSnapshot: z
    .array(z.lazy(/* istanbul ignore next */ () => CVRSnapshotSchema))
    .min(1),
  CreatingDeviceId: z.optional(z.string()),
  CurrentSnapshotId: z.string(),
  ElectionId: z.string(),
  PartyIds: z.optional(z.array(z.string())),
  UniqueId: z.optional(z.string()),
  vxBallotType: z.union([
    z.literal('absentee'),
    z.literal('provisional'),
    z.literal('standard'),
  ]),
  vxLayouts: z
    .tuple([
      BallotPageLayoutSchema.nullable(),
      BallotPageLayoutSchema.nullable(),
    ])
    .optional(),
});

/**
 * CVRContest class is included by CVRSnapshot for each contest on the ballot that was voted, that is, whose contest options contain indications that may constitute a vote. CVRContest includes CVRContestSelection for each contest option in the contest containing an indication or write-in.     CVRSnapshot can also include CVRContest for every contest on the ballot regardless of whether any of the contest options contain an indication, for cases where the CVR must include all contests that appeared on the ballot.     CVRContest attributes are for including summary information about the contest.  Overvotes plus Undervotes plus TotalVotes must equal the number of votes allowable in the contest, e.g., in a &quot;chose 3 of 5&quot; contest in which the voter chooses only 2, then Overvotes = 0, Undervotes = 1, and TotalVotes = 2, which adds up to the number of votes allowable = 3.
 */
export interface CVRContest {
  readonly '@type': 'CVR.CVRContest';

  /**
   * Used to include information about a contest selection in the contest, including the associated indication(s).
   */
  readonly CVRContestSelection?: readonly CVRContestSelection[];

  /**
   * Used to link to an instance of Contest specific to the contest at hand, for the purpose of specifying information about the contest such as its contest identifier.
   */
  readonly ContestId: string;

  /**
   * Used when Status is 'other' to include a user-defined status.
   */
  readonly OtherStatus?: string;

  /**
   * The number of votes lost due to overvoting.
   */
  readonly Overvotes?: integer;

  /**
   * Used to indicate the number of possible contest selections in the contest.
   */
  readonly Selections?: integer;

  /**
   * The status of the contest, e.g., overvoted, undervoted, from the ContestStatus enumeration.  If no values apply, use 'other' and include a user-defined status in OtherStatus.
   */
  readonly Status?: readonly ContestStatus[];

  /**
   * The number of votes lost due to undervoting.
   */
  readonly Undervotes?: integer;

  /**
   * The total number of write-ins in the contest.
   */
  readonly WriteIns?: integer;
}

/**
 * Schema for {@link CVRContest}.
 */
export const CVRContestSchema: z.ZodSchema<CVRContest> = z.object({
  '@type': z.literal('CVR.CVRContest'),
  CVRContestSelection: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CVRContestSelectionSchema))
  ),
  ContestId: z.string(),
  OtherStatus: z.optional(z.string()),
  Overvotes: z.optional(integerSchema),
  Selections: z.optional(integerSchema),
  Status: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => ContestStatusSchema))
  ),
  Undervotes: z.optional(integerSchema),
  WriteIns: z.optional(integerSchema),
});

/**
 * CVRContestSelection is used to link a contest option containing an indication with information about the indication, such as whether a mark constitutes a countable vote, or whether a mark is determined to be marginal, etc.  CVRContest includes an instance of CVRContestSelection when an indication for the selection is present, and CVRContestSelection then includes SelectionPosition for each indication present. To tie the indication to the specific contest selection, CVRContestSelection links to an instance of ContestSelection that has previously been included by Contest.    Since multiple indications per contest option are possible for some voting methods, CVRContestSelection can include multiple instances of SelectionPosition, one per indication. CVRContestSelection can also be used for the purpose of including, in the CVR, all contest options in the contest regardless of whether indications are present.  In this case, CVRContestSelection would not include SelectionPosition if no indication is present but would link to the appropriate instance of ContestSelection.
 */
export interface CVRContestSelection {
  readonly '@type': 'CVR.CVRContestSelection';

  /**
   * Used to link to an instance of a contest selection that was previously included by Contest.
   */
  readonly ContestSelectionId?: string;

  /**
   * Used to include the ordinal position of the contest option as it appeared on the ballot.
   */
  readonly OptionPosition?: integer;

  /**
   * Used when Status is 'other' to include a user-defined status.
   */
  readonly OtherStatus?: string;

  /**
   * For the RCV voting variation, the rank chosen by the voter, for when a contest selection can represent a ranking.
   */
  readonly Rank?: integer;

  /**
   * Used to include further information about the indication/mark associated with the contest selection.  Depending on the voting method, multiple indications/marks per selection may be possible.
   */
  readonly SelectionPosition: readonly SelectionPosition[];

  /**
   * Contains the status of the contest selection, e.g., 'needs-adjudication' for a contest requiring adjudication, using values from the ContestSelectionStatus enumeration.  If no values apply, use 'other' and include a user-defined status in OtherStatus.
   */
  readonly Status?: readonly ContestSelectionStatus[];

  /**
   * For cumulative or range and other similar voting variations, contains the total proper fractional number of votes across all indications/marks.
   */
  readonly TotalFractionalVotes?: FractionalNumber;

  /**
   * For cumulative or range and other similar voting variations, contains the total number of votes across all indications/marks.
   */
  readonly TotalNumberVotes?: integer;
}

/**
 * Schema for {@link CVRContestSelection}.
 */
export const CVRContestSelectionSchema: z.ZodSchema<CVRContestSelection> =
  z.object({
    '@type': z.literal('CVR.CVRContestSelection'),
    ContestSelectionId: z.optional(z.string()),
    OptionPosition: z.optional(integerSchema),
    OtherStatus: z.optional(z.string()),
    Rank: z.optional(integerSchema),
    SelectionPosition: z
      .array(z.lazy(/* istanbul ignore next */ () => SelectionPositionSchema))
      .min(1),
    Status: z.optional(
      z.array(
        z.lazy(/* istanbul ignore next */ () => ContestSelectionStatusSchema)
      )
    ),
    TotalFractionalVotes: z.optional(
      z.lazy(/* istanbul ignore next */ () => FractionalNumberSchema)
    ),
    TotalNumberVotes: z.optional(integerSchema),
  });

/**
 * CVRSnapshot contains a version of the contest selections for a CVR; there can be multiple versions of CVRSnapshot within the same CVR.  Type specifies the type of the snapshot, i.e., whether interpreted by the scanner according to contest rules, modified as a result of adjudication, or the original, that is, the version initially scanned before contest rules are applied.  CVR includes CVRSnapshot.Other attributes are repeated in each CVRSnapshot because they may differ across snapshots, e.g., the contests could be different as well as other status.
 */
export interface CVRSnapshot {
  readonly '@id': string;

  readonly '@type': 'CVR.CVRSnapshot';

  /**
   * Used to include an annotation associated with the CVR snapshot.
   */
  readonly Annotation?: readonly Annotation[];

  /**
   * Identifies the contests in the CVR.
   */
  readonly CVRContest?: readonly CVRContest[];

  /**
   * When Status is 'other', contains the ballot status.
   */
  readonly OtherStatus?: string;

  /**
   * The status of the CVR.
   */
  readonly Status?: readonly CVRStatus[];

  /**
   * The type of the snapshot, e.g., original.
   */
  readonly Type: CVRType;
}

/**
 * Schema for {@link CVRSnapshot}.
 */
export const CVRSnapshotSchema: z.ZodSchema<CVRSnapshot> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.CVRSnapshot'),
  Annotation: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => AnnotationSchema))
  ),
  CVRContest: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CVRContestSchema))
  ),
  OtherStatus: z.optional(z.string()),
  Status: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CVRStatusSchema))
  ),
  Type: z.lazy(/* istanbul ignore next */ () => CVRTypeSchema),
});

/**
 * CVRWriteIn is used when the contest selection is a write-in. It has attributes for the image or text of the write-in.
 */
export interface CVRWriteIn {
  readonly '@type': 'CVR.CVRWriteIn';

  /**
   * Used for the text of the write-in, typically present when the CVR has been created by electronic ballot marking equipment.
   */
  readonly Text?: string;

  /**
   * Used for an image of the write-in, typically made by a scanner when scanning a paper ballot.
   */
  readonly WriteInImage?: ImageData;
}

/**
 * Schema for {@link CVRWriteIn}.
 */
export const CVRWriteInSchema: z.ZodSchema<CVRWriteIn> = z.object({
  '@type': z.literal('CVR.CVRWriteIn'),
  Text: z.optional(z.string()),
  WriteInImage: z.optional(
    z.lazy(/* istanbul ignore next */ () => ImageDataSchema)
  ),
});

/**
 * Candidate identifies a candidate in a contest on the voter's ballot.  Election includes instances of Candidate for each candidate in a contest; typically, only those candidates who received votes would be included.
 */
export interface Candidate {
  readonly '@id': string;

  readonly '@type': 'CVR.Candidate';

  /**
   * A code or identifier associated with the candidate.
   */
  readonly Code?: readonly Code[];

  /**
   * Candidate's name as listed on the ballot.
   */
  readonly Name?: string;

  /**
   * The party associated with the candidate.
   */
  readonly PartyId?: string;
}

/**
 * Schema for {@link Candidate}.
 */
export const CandidateSchema: z.ZodSchema<Candidate> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.Candidate'),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  Name: z.optional(z.string()),
  PartyId: z.optional(z.string()),
});

/**
 * CandidateContest is a subclass of Contest and is used to identify the type of contest as involving one or more candidates. It inherits attributes from Contest.
 */
export interface CandidateContest {
  readonly '@id': string;

  readonly '@type': 'CVR.CandidateContest';

  /**
   * An abbreviation associated with the contest.
   */
  readonly Abbreviation?: string;

  /**
   * A code or identifier used for this contest.
   */
  readonly Code?: readonly Code[];

  /**
   * Identifies the contest selections in the contest.
   */
  readonly ContestSelection: ReadonlyArray<
    | ContestSelection
    | PartySelection
    | BallotMeasureSelection
    | CandidateSelection
  >;

  /**
   * Title or name of the contest, e.g., "Governor" or "Question on Legalization of Gambling".
   */
  readonly Name?: string;

  /**
   * The number of candidates to be elected in the contest.
   */
  readonly NumberElected?: integer;

  /**
   * If VoteVariation is 'other', the vote variation for this contest.
   */
  readonly OtherVoteVariation?: string;

  /**
   * The party associated with the contest, if a partisan primary.
   */
  readonly PrimaryPartyId?: string;

  /**
   * The vote variation for this contest, from the VoteVariation enumeration.
   */
  readonly VoteVariation?: VoteVariation;

  /**
   * The number of votes allowed in the contest, e.g., 3 for a 'choose 3 of 5 candidates' contest.
   */
  readonly VotesAllowed?: integer;
}

/**
 * Schema for {@link CandidateContest}.
 */
export const CandidateContestSchema: z.ZodSchema<CandidateContest> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.CandidateContest'),
  Abbreviation: z.optional(z.string()),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  ContestSelection: z
    .array(
      z.union([
        z.lazy(/* istanbul ignore next */ () => ContestSelectionSchema),
        z.lazy(/* istanbul ignore next */ () => PartySelectionSchema),
        z.lazy(/* istanbul ignore next */ () => BallotMeasureSelectionSchema),
        z.lazy(/* istanbul ignore next */ () => CandidateSelectionSchema),
      ])
    )
    .min(1),
  Name: z.optional(z.string()),
  NumberElected: z.optional(integerSchema),
  OtherVoteVariation: z.optional(z.string()),
  PrimaryPartyId: z.optional(z.string()),
  VoteVariation: z.optional(
    z.lazy(/* istanbul ignore next */ () => VoteVariationSchema)
  ),
  VotesAllowed: z.optional(integerSchema),
});

/**
 * CandidateSelection is a subclass of ContestSelection and is used for candidates, including for write-in candidates.
 */
export interface CandidateSelection {
  readonly '@id': string;

  readonly '@type': 'CVR.CandidateSelection';

  /**
   * The candidate associated with the contest selection. For contests involving a ticket of multiple candidates, an ordered list of candidates as they appeared on the ballot would be created.
   */
  readonly CandidateIds?: readonly string[];

  /**
   * Code used to identify the contest selection.
   */
  readonly Code?: readonly Code[];

  /**
   * A flag to indicate if the candidate selection is associated with a write-in.
   */
  readonly IsWriteIn?: boolean;
}

/**
 * Schema for {@link CandidateSelection}.
 */
export const CandidateSelectionSchema: z.ZodSchema<CandidateSelection> =
  z.object({
    '@id': z.string(),
    '@type': z.literal('CVR.CandidateSelection'),
    CandidateIds: z.optional(z.array(z.string())),
    Code: z.optional(
      z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
    ),
    IsWriteIn: z.optional(z.boolean()),
  });

/**
 * Represents metadata about a batch (like it's label) and is linked to by
 * a BatchId in {@link CVR}.
 */
export interface Batch {
  '@type': 'CVR.vxBatch';
  '@id': string;
  BatchLabel: string;
}

/**
 * Schema for {@link Batch}.
 */
export const BatchSchema: z.ZodSchema<Batch> = z.object({
  '@type': z.literal('CVR.vxBatch'),
  '@id': z.string(),
  BatchLabel: z.string(),
});

/**
 * The root class/element; attributes pertain to the status and format of the report and when created.CastVoteRecordReport includes multiple instances of CVR, one per CVR or sheet of a multi-page cast vote record.  CastVoteRecordReport also includes multiple instances of Contest, typically only for those contests that were voted so as to reduce file size.  The Contest instances are later referenced by other classes to link them to contest options that were voted and the indication(s)/mark(s) made.
 */
export interface CastVoteRecordReport {
  readonly '@type': 'CVR.CastVoteRecordReport';

  /**
   * Used to include instances of CVR classes, one per cast vote record in the report.
   */
  readonly CVR?: readonly CVR[];

  /**
   * Used to include the election(s) associated with the CVRs.
   */
  readonly Election: readonly Election[];

  /**
   * Identifies the time that the election report was created.
   */
  readonly GeneratedDate: DateTime;

  /**
   * Used to include the political geography, i.e., location, for where the cast vote record report was created and for linking cast vote records to their corresponding precinct or split (or otherwise smallest unit).
   */
  readonly GpUnit: readonly GpUnit[];

  /**
   * Notes that can be added as appropriate, presumably by an adjudicator.
   */
  readonly Notes?: string;

  /**
   * If ReportType is 'other', this contains the report type.
   */
  readonly OtherReportType?: string;

  /**
   * The party associated with the ballot sheet for a partisan primary.
   */
  readonly Party?: readonly Party[];

  /**
   * Identifies the device used to create the CVR report.
   */
  readonly ReportGeneratingDeviceIds: readonly string[];

  /**
   * The type of report, using the ReportType enumeration.
   */
  readonly ReportType?: readonly ReportType[];

  /**
   * The device creating the report.  The reporting device need not necessarily be the creating device, i.e., for an aggregated report, the reporting device could be an EMS used to aggregate and tabulate cast vote records.
   */
  readonly ReportingDevice: readonly ReportingDevice[];

  /**
   * The version of the CVR specification being used (1.0).
   */
  readonly Version: CastVoteRecordVersion;

  /**
   * The batches which contain the included CVRs.
   */
  readonly Batch?: Batch[];
}

/**
 * Schema for {@link CastVoteRecordReport}.
 */
export const CastVoteRecordReportSchema: z.ZodSchema<CastVoteRecordReport> =
  z.object({
    '@type': z.literal('CVR.CastVoteRecordReport'),
    CVR: z.optional(
      z.array(z.lazy(/* istanbul ignore next */ () => CVRSchema))
    ),
    Election: z
      .array(z.lazy(/* istanbul ignore next */ () => ElectionSchema))
      .min(1),
    GeneratedDate: DateTimeSchema,
    GpUnit: z
      .array(z.lazy(/* istanbul ignore next */ () => GpUnitSchema))
      .min(1),
    Notes: z.optional(z.string()),
    OtherReportType: z.optional(z.string()),
    Party: z.optional(
      z.array(z.lazy(/* istanbul ignore next */ () => PartySchema))
    ),
    ReportGeneratingDeviceIds: z.array(z.string()).min(1),
    ReportType: z.optional(
      z.array(z.lazy(/* istanbul ignore next */ () => ReportTypeSchema))
    ),
    ReportingDevice: z
      .array(z.lazy(/* istanbul ignore next */ () => ReportingDeviceSchema))
      .min(1),
    Version: z.lazy(
      /* istanbul ignore next */ () => CastVoteRecordVersionSchema
    ),
  });

/**
 * Code is used in Election, GpUnit, Contest, Candidate, and Party to identify an associated code as well as the type of code.
 */
export interface Code {
  readonly '@type': 'CVR.Code';

  /**
   * A label associated with the code, used as needed.
   */
  readonly Label?: string;

  /**
   * If Type is 'other', the type of code.
   */
  readonly OtherType?: string;

  /**
   * Used to indicate the type of code, from the IdentifierType enumeration.
   */
  readonly Type: IdentifierType;

  /**
   * The value of the code, i.e., the identifier.
   */
  readonly Value: string;
}

/**
 * Schema for {@link Code}.
 */
export const CodeSchema: z.ZodSchema<Code> = z.object({
  '@type': z.literal('CVR.Code'),
  Label: z.optional(z.string()),
  OtherType: z.optional(z.string()),
  Type: z.lazy(/* istanbul ignore next */ () => IdentifierTypeSchema),
  Value: z.string(),
});

/**
 * Contest represents a contest on the ballot. CastVoteRecordReport initially includes an instance of Contest for each contest on the ballot.  Other classes can subsequently reference the instances as necessary to link together items on the cast vote record, such as a contest, its voted contest selection(s), and the mark(s) associated with the selection(s).
 *
 * Contest has three subclasses, each used for a specific type of contest:   These subclasses inherit Contest's attributes.
 *
 * PartyContest - used for straight party contests,
 *
 * BallotMeasureContest - used for contests, and
 *
 * CandidateContest - used for candidate contests.
 */
export interface Contest {
  readonly '@id': string;

  readonly '@type': 'CVR.Contest';

  /**
   * An abbreviation associated with the contest.
   */
  readonly Abbreviation?: string;

  /**
   * A code or identifier used for this contest.
   */
  readonly Code?: readonly Code[];

  /**
   * Identifies the contest selections in the contest.
   */
  readonly ContestSelection: ReadonlyArray<
    | ContestSelection
    | PartySelection
    | BallotMeasureSelection
    | CandidateSelection
  >;

  /**
   * Title or name of the contest, e.g., "Governor" or "Question on Legalization of Gambling".
   */
  readonly Name?: string;

  /**
   * If VoteVariation is 'other', the vote variation for this contest.
   */
  readonly OtherVoteVariation?: string;

  /**
   * The vote variation for this contest, from the VoteVariation enumeration.
   */
  readonly VoteVariation?: VoteVariation;
}

/**
 * Schema for {@link Contest}.
 */
export const ContestSchema: z.ZodSchema<Contest> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.Contest'),
  Abbreviation: z.optional(z.string()),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  ContestSelection: z
    .array(
      z.union([
        z.lazy(/* istanbul ignore next */ () => ContestSelectionSchema),
        z.lazy(/* istanbul ignore next */ () => PartySelectionSchema),
        z.lazy(/* istanbul ignore next */ () => BallotMeasureSelectionSchema),
        z.lazy(/* istanbul ignore next */ () => CandidateSelectionSchema),
      ])
    )
    .min(1),
  Name: z.optional(z.string()),
  OtherVoteVariation: z.optional(z.string()),
  VoteVariation: z.optional(
    z.lazy(/* istanbul ignore next */ () => VoteVariationSchema)
  ),
});

/**
 * ContestSelection represents a contest selection in a contest.  Contest can include an instance of ContestSelection for each contest selection in the contest or, as desired, all contest selections.
 *
 * ContestSelection has three subclasses, each used for a specific type of contest selection:
 *
 * BallotMeasureSelection - used for ballot measures,
 *
 * CandidateSelection - used for candidate selections, and
 *
 * PartySelection - used for straight party selections.
 *
 * Instances of CVRContestSelection subsequently link to the contest selections as needed so as to tie together the contest, the contest selection, and the mark(s) made for the contest selection.
 *
 * ContestSelection contains one attribute, Code, that can be used to identify the contest selection and thereby eliminate the need to identify it using the subclasses.
 */
export interface ContestSelection {
  readonly '@id': string;

  readonly '@type': 'CVR.ContestSelection';

  /**
   * Code used to identify the contest selection.
   */
  readonly Code?: readonly Code[];
}

/**
 * Schema for {@link ContestSelection}.
 */
export const ContestSelectionSchema: z.ZodSchema<ContestSelection> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.ContestSelection'),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
});

/**
 * Election defines instances of the Contest and Candidate classes so that they can be later referenced in CVR classes.  Election includes an instance of Contest for each contest in the election and includes an instance of Candidate for each candidate.  This is done to utilize file sizes more efficiently; otherwise each CVR would need to define these instances separately and much duplication would occur.
 */
export interface Election {
  readonly '@id': string;

  readonly '@type': 'CVR.Election';

  /**
   * Used to establish a collection of candidate definitions that will be referenced by the CVRs.  The contests in each CVR will reference the candidate definitions.
   */
  readonly Candidate?: readonly Candidate[];

  /**
   * Used for a code associated with the election, e.g., a precinct identifier if the election scope is a precinct.
   */
  readonly Code?: readonly Code[];

  /**
   * Used for establishing a collection of contest definitions that will be referenced by the CVRs.
   */
  readonly Contest: ReadonlyArray<
    | Contest
    | PartyContest
    | BallotMeasureContest
    | CandidateContest
    | RetentionContest
  >;

  /**
   * Used to identify the election scope, i.e., the political geography corresponding to the election.
   */
  readonly ElectionScopeId: string;

  /**
   * A text string identifying the election.
   */
  readonly Name?: string;
}

/**
 * Schema for {@link Election}.
 */
export const ElectionSchema: z.ZodSchema<Election> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.Election'),
  Candidate: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CandidateSchema))
  ),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  Contest: z
    .array(
      z.union([
        z.lazy(/* istanbul ignore next */ () => ContestSchema),
        z.lazy(/* istanbul ignore next */ () => PartyContestSchema),
        z.lazy(/* istanbul ignore next */ () => BallotMeasureContestSchema),
        z.lazy(/* istanbul ignore next */ () => CandidateContestSchema),
        z.lazy(/* istanbul ignore next */ () => RetentionContestSchema),
      ])
    )
    .min(1),
  ElectionScopeId: z.string(),
  Name: z.optional(z.string()),
});

/**
 * Used to hold the contents of a file or identify a file created by the scanning device.  The file generally would contain an image of the scanned ballot or an image of a write-in entered by a voter onto the scanned ballot.  SubClass Image is used if the file contains an image.
 */
export interface File {
  readonly '@type': 'CVR.File';

  readonly Data: Byte;

  /**
   * Contains the name of the file or an identifier of the file.
   */
  readonly FileName?: string;

  /**
   * The mime type of the file, e.g., image/jpeg.
   */
  readonly MimeType?: string;
}

/**
 * Schema for {@link File}.
 */
export const FileSchema: z.ZodSchema<File> = z.object({
  '@type': z.literal('CVR.File'),
  Data: ByteSchema,
  FileName: z.optional(z.string()),
  MimeType: z.optional(z.string()),
});

/**
 * Used for identifying a geographical unit for various purposes, including:
 *
 * The reporting unit of the report generation device, e.g., a precinct location of a scanner that generates the collection of CVRs,
 *
 * The geographical scope of the election, or the unit of geography associated with an individual CVR.
 *
 * CastVoteRecordReport includes instances of GpUnit as needed. Election references GpUnit as ElectionScope, for the geographical scope of the election.  CVR CastVoteRecordReport includes instances of GpUnit as needed. Election references GpUnit as ElectionScope, for the geographical scope of the election.  CVR references GpUnit as BallotStyleUnit to link a CVR to the smallest political subdivision that uses the same ballot style as was used for the voter's ballot.
 */
export interface GpUnit {
  readonly '@id': string;

  readonly '@type': 'CVR.GpUnit';

  /**
   * A code associated with the geographical unit.
   */
  readonly Code?: readonly Code[];

  /**
   * Name of the geographical unit.
   */
  readonly Name?: string;

  /**
   * Used when Type is 'other' to include a user-defined type.
   */
  readonly OtherType?: string;

  /**
   * The collection of cast vote records associated with the reporting unit and the reporting device.
   */
  readonly ReportingDeviceIds?: readonly string[];

  /**
   * Contains the type of geographical unit, e.g., precinct, split-precinct, vote center, using values from the ReportingUnitType enumeration.  If no values apply, use 'other' and include a user-defined type in OtherType.
   */
  readonly Type: ReportingUnitType;
}

/**
 * Schema for {@link GpUnit}.
 */
export const GpUnitSchema: z.ZodSchema<GpUnit> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.GpUnit'),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  Name: z.optional(z.string()),
  OtherType: z.optional(z.string()),
  ReportingDeviceIds: z.optional(z.array(z.string())),
  Type: z.lazy(/* istanbul ignore next */ () => ReportingUnitTypeSchema),
});

/**
 * Hash is used to specify a hash associated with a file such as an image file of a scanned ballot.
 */
export interface Hash {
  readonly '@type': 'CVR.Hash';

  /**
   * If Type is 'other', the type of the hash.
   */
  readonly OtherType?: string;

  /**
   * The type of the hash, from the HashType enumeration.
   */
  readonly Type: HashType;

  /**
   * The hash value, encoded as a string.
   */
  readonly Value: string;
}

/**
 * Schema for {@link Hash}.
 */
export const HashSchema: z.ZodSchema<Hash> = z.object({
  '@type': z.literal('CVR.Hash'),
  OtherType: z.optional(z.string()),
  Type: z.lazy(/* istanbul ignore next */ () => HashTypeSchema),
  Value: z.string(),
});

/**
 * Used by File for a file containing an image, e.g., an image of a write-in on a paper ballot.
 */
export interface Image {
  readonly '@type': 'CVR.Image';

  readonly Data: Byte;

  /**
   * Contains the name of the file or an identifier of the file.
   */
  readonly FileName?: string;

  /**
   * The mime type of the file, e.g., image/jpeg.
   */
  readonly MimeType?: string;
}

/**
 * Schema for {@link Image}.
 */
export const ImageSchema: z.ZodSchema<Image> = z.object({
  '@type': z.literal('CVR.Image'),
  Data: ByteSchema,
  FileName: z.optional(z.string()),
  MimeType: z.optional(z.string()),
});

/**
 * ImageData is used to specify an image file such as for a write-in or the entire ballot.  It works with several other classes, as follows:
 *
 * File with SubClass Image – to contain either a filename for an external file or the file contents, and
 *
 * Hash – to contain cryptographic hash function data for the file.
 */
export interface ImageData {
  readonly '@type': 'CVR.ImageData';

  /**
   * A hash value for the image data, used for verification comparisons against subsequent copies of the image.
   */
  readonly Hash?: Hash;

  /**
   * The image of an individual ballot sheet created by the scanner, could possibly include both sides of a two-sided ballot sheet depending on the scanner's configuration.
   */
  readonly Image?: Image;

  /**
   * A pointer to the location of the image file.
   */
  readonly Location?: Uri;
}

/**
 * Schema for {@link ImageData}.
 */
export const ImageDataSchema: z.ZodSchema<ImageData> = z.object({
  '@type': z.literal('CVR.ImageData'),
  Hash: z.optional(z.lazy(/* istanbul ignore next */ () => HashSchema)),
  Image: z.optional(z.lazy(/* istanbul ignore next */ () => ImageSchema)),
  Location: z.optional(UriSchema),
});

/**
 * Party is used for describing information about a political party associated with the voter's ballot.  CVR includes instances of Party as needed, e.g., for a CVR corresponding to a ballot in a partisan primary, and CandidateContest references Party as needed to link a candidate to their political party.
 */
export interface Party {
  readonly '@id': string;

  readonly '@type': 'CVR.Party';

  /**
   * Short name for the party, e.g., "DEM".
   */
  readonly Abbreviation?: string;

  /**
   * A code associated with the party.
   */
  readonly Code?: readonly Code[];

  /**
   * Official full name of the party, e.g., "Republican".
   */
  readonly Name?: string;
}

/**
 * Schema for {@link Party}.
 */
export const PartySchema: z.ZodSchema<Party> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.Party'),
  Abbreviation: z.optional(z.string()),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  Name: z.optional(z.string()),
});

/**
 * PartyContest is a subclass of Contest and is used to identify the type of contest as involving a straight party selection.  It inherits attributes from Contest.
 */
export interface PartyContest {
  readonly '@id': string;

  readonly '@type': 'CVR.PartyContest';

  /**
   * An abbreviation associated with the contest.
   */
  readonly Abbreviation?: string;

  /**
   * A code or identifier used for this contest.
   */
  readonly Code?: readonly Code[];

  /**
   * Identifies the contest selections in the contest.
   */
  readonly ContestSelection: ReadonlyArray<
    | ContestSelection
    | PartySelection
    | BallotMeasureSelection
    | CandidateSelection
  >;

  /**
   * Title or name of the contest, e.g., "Governor" or "Question on Legalization of Gambling".
   */
  readonly Name?: string;

  /**
   * If VoteVariation is 'other', the vote variation for this contest.
   */
  readonly OtherVoteVariation?: string;

  /**
   * The vote variation for this contest, from the VoteVariation enumeration.
   */
  readonly VoteVariation?: VoteVariation;
}

/**
 * Schema for {@link PartyContest}.
 */
export const PartyContestSchema: z.ZodSchema<PartyContest> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.PartyContest'),
  Abbreviation: z.optional(z.string()),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  ContestSelection: z
    .array(
      z.union([
        z.lazy(/* istanbul ignore next */ () => ContestSelectionSchema),
        z.lazy(/* istanbul ignore next */ () => PartySelectionSchema),
        z.lazy(/* istanbul ignore next */ () => BallotMeasureSelectionSchema),
        z.lazy(/* istanbul ignore next */ () => CandidateSelectionSchema),
      ])
    )
    .min(1),
  Name: z.optional(z.string()),
  OtherVoteVariation: z.optional(z.string()),
  VoteVariation: z.optional(
    z.lazy(/* istanbul ignore next */ () => VoteVariationSchema)
  ),
});

/**
 * PartySelection is a subclass of ContestSelection and is used typically for a contest selection in a straight-party contest.
 */
export interface PartySelection {
  readonly '@id': string;

  readonly '@type': 'CVR.PartySelection';

  /**
   * Code used to identify the contest selection.
   */
  readonly Code?: readonly Code[];

  /**
   * The party associated with the contest selection.
   */
  readonly PartyIds: readonly string[];
}

/**
 * Schema for {@link PartySelection}.
 */
export const PartySelectionSchema: z.ZodSchema<PartySelection> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.PartySelection'),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  PartyIds: z.array(z.string()).min(1),
});

/**
 * ReportingDevice is used to specify a voting device as the "political geography" at hand.  CastVoteRecordReport refers to it as ReportGeneratingDevice and uses it to specify the device that created the CVR report. CVR refers to it as CreatingDevice to specify the device that created the CVRs.
 */
export interface ReportingDevice {
  readonly '@id': string;

  readonly '@type': 'CVR.ReportingDevice';

  /**
   * The application associated with the reporting device.
   */
  readonly Application?: string;

  /**
   * A code associated with the reporting device.
   */
  readonly Code?: readonly Code[];

  /**
   * Manufacturer of the reporting device.
   */
  readonly Manufacturer?: string;

  /**
   * The type of metric being used to determine quality.  The type must be specific enough that the attached value can be accurately verified later, e.g., 'Acme Mark Density' may be a sufficiently specific type.
   */
  readonly MarkMetricType?: string;

  /**
   * Manufacturer's model of the reporting device.
   */
  readonly Model?: string;

  /**
   * Additional explanatory notes as applicable.
   */
  readonly Notes?: readonly string[];

  /**
   * Serial number or other identification that can uniquely identify the reporting device.
   */
  readonly SerialNumber?: string;
}

/**
 * Schema for {@link ReportingDevice}.
 */
export const ReportingDeviceSchema: z.ZodSchema<ReportingDevice> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.ReportingDevice'),
  Application: z.optional(z.string()),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  Manufacturer: z.optional(z.string()),
  MarkMetricType: z.optional(z.string()),
  Model: z.optional(z.string()),
  Notes: z.optional(z.array(z.string())),
  SerialNumber: z.optional(z.string()),
});

/**
 * RetentionContest is a subclass of BallotMeasureContest and is used to identify the type of contest as involving a retention, such as for a judicial retention.  While it is similar to BallotMeasureContest, it contains a link to Candidate that BallotMeasureContest does not.  RetentionContest inherits attributes from Contest.
 */
export interface RetentionContest {
  readonly '@id': string;

  readonly '@type': 'CVR.RetentionContest';

  /**
   * An abbreviation associated with the contest.
   */
  readonly Abbreviation?: string;

  /**
   * Identifies the candidate in the retention contest.
   */
  readonly CandidateId?: string;

  /**
   * A code or identifier used for this contest.
   */
  readonly Code?: readonly Code[];

  /**
   * Identifies the contest selections in the contest.
   */
  readonly ContestSelection: ReadonlyArray<
    | ContestSelection
    | PartySelection
    | BallotMeasureSelection
    | CandidateSelection
  >;

  /**
   * Title or name of the contest, e.g., "Governor" or "Question on Legalization of Gambling".
   */
  readonly Name?: string;

  /**
   * If VoteVariation is 'other', the vote variation for this contest.
   */
  readonly OtherVoteVariation?: string;

  /**
   * The vote variation for this contest, from the VoteVariation enumeration.
   */
  readonly VoteVariation?: VoteVariation;
}

/**
 * Schema for {@link RetentionContest}.
 */
export const RetentionContestSchema: z.ZodSchema<RetentionContest> = z.object({
  '@id': z.string(),
  '@type': z.literal('CVR.RetentionContest'),
  Abbreviation: z.optional(z.string()),
  CandidateId: z.optional(z.string()),
  Code: z.optional(
    z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
  ),
  ContestSelection: z
    .array(
      z.union([
        z.lazy(/* istanbul ignore next */ () => ContestSelectionSchema),
        z.lazy(/* istanbul ignore next */ () => PartySelectionSchema),
        z.lazy(/* istanbul ignore next */ () => BallotMeasureSelectionSchema),
        z.lazy(/* istanbul ignore next */ () => CandidateSelectionSchema),
      ])
    )
    .min(1),
  Name: z.optional(z.string()),
  OtherVoteVariation: z.optional(z.string()),
  VoteVariation: z.optional(
    z.lazy(/* istanbul ignore next */ () => VoteVariationSchema)
  ),
});

/**
 * CVRContestSelection includes SelectionPosition to specify a voter's indication/mark in a contest option, and thus, a potential vote. The number of potential SelectionPositions that could be included by CVRContestSelection is the same as the number of ovals next to a particular option. There will be usually 1 instance of SelectionPosition for plurality voting, but there could be multiple instances for RCV, approval, cumulative, or other vote variations in which a voter can select multiple options per candidate.   MarkMetricValue specifies the measurement of a mark on a paper ballot. The measurement is assigned by the scanner for measurements of mark density or quality and would be used by the scanner to indicate whether the mark is a valid voter mark representing a vote or is marginal.SelectionPosition contains additional information about the mark to specify whether the indication/mark is allocable, as well as information needed for certain voting methods.SelectionPosition includes CVRWriteIn, whose attributes are used to include information about the write-in including the text of the write-in or an image of the write-in.
 */
export interface SelectionPosition {
  readonly '@type': 'CVR.SelectionPosition';

  /**
   * Used to store information regarding a write-in vote.
   */
  readonly CVRWriteIn?: CVRWriteIn;

  /**
   * Code used to identify the contest selection position.
   */
  readonly Code?: readonly Code[];

  /**
   * The proper fractional number of votes represented by the position.
   */
  readonly FractionalVotes?: FractionalNumber;

  /**
   * Whether there is a selection indication present.
   */
  readonly HasIndication: IndicationStatus;

  /**
   * Whether this indication should be allocated to the contest option's accumulator.
   */
  readonly IsAllocable?: AllocationStatus;

  /**
   * Whether or not the indication was generated, rather than directly made by the voter.
   */
  readonly IsGenerated?: boolean;

  /**
   * The value of the mark metric, represented as a string.
   */
  readonly MarkMetricValue?: readonly string[];

  /**
   * The number of votes represented by the position, usually 1 but may be more depending on the voting method.
   */
  readonly NumberVotes: integer;

  /**
   * Used when Status is 'other' to include a user-defined status.
   */
  readonly OtherStatus?: string;

  /**
   * The ordinal position of the selection position within the contest option.
   */
  readonly Position?: integer;

  /**
   * For the RCV voting variation, the rank chosen by the voter, for when a position can represent a ranking.
   */
  readonly Rank?: integer;

  /**
   * Status of the position, e.g., &quot;generated-rules&quot; for generated by the machine, from the PositionStatus enumeration.  If no values apply, use 'other' and include a user-defined status in OtherStatus.
   */
  readonly Status?: readonly PositionStatus[];
}

/**
 * Schema for {@link SelectionPosition}.
 */
export const SelectionPositionSchema: z.ZodSchema<SelectionPosition> = z.object(
  {
    '@type': z.literal('CVR.SelectionPosition'),
    CVRWriteIn: z.optional(
      z.lazy(/* istanbul ignore next */ () => CVRWriteInSchema)
    ),
    Code: z.optional(
      z.array(z.lazy(/* istanbul ignore next */ () => CodeSchema))
    ),
    FractionalVotes: z.optional(
      z.lazy(/* istanbul ignore next */ () => FractionalNumberSchema)
    ),
    HasIndication: z.lazy(
      /* istanbul ignore next */ () => IndicationStatusSchema
    ),
    IsAllocable: z.optional(
      z.lazy(/* istanbul ignore next */ () => AllocationStatusSchema)
    ),
    IsGenerated: z.optional(z.boolean()),
    MarkMetricValue: z.optional(z.array(z.string())),
    NumberVotes: integerSchema,
    OtherStatus: z.optional(z.string()),
    Position: z.optional(integerSchema),
    Rank: z.optional(integerSchema),
    Status: z.optional(
      z.array(z.lazy(/* istanbul ignore next */ () => PositionStatusSchema))
    ),
  }
);
