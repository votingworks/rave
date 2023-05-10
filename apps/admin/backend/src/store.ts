//
// The durable datastore for election data, CVRs, and adjudication info.
//

import {
  Optional,
  Result,
  err,
  ok,
  typedAs,
  isResult,
  assertDefined,
  find,
  assert,
} from '@votingworks/basics';
import { Bindable, Client as DbClient } from '@votingworks/db';
import {
  BallotId,
  BallotPageLayout,
  BallotPageLayoutSchema,
  CandidateContest,
  CastVoteRecord,
  ContestId,
  ContestOptionId,
  CVR,
  Id,
  Iso8601Timestamp,
  safeParse,
  safeParseElectionDefinition,
  safeParseJson,
  Side,
  SystemSettings,
  SystemSettingsDbRow,
} from '@votingworks/types';
import { join } from 'path';
import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';
import {
  CastVoteRecordFileEntryRecord,
  CastVoteRecordFileRecord,
  CastVoteRecordFileRecordSchema,
  CastVoteRecordMetadata,
  CvrFileMode,
  DatabaseSerializedCastVoteRecordVotes,
  DatabaseSerializedCastVoteRecordVotesSchema,
  ElectionRecord,
  ScannerBatch,
  WriteInAdjudicationAction,
  WriteInAdjudicationStatus,
  WriteInCandidateRecord,
  WriteInRecord,
  WriteInRecordAdjudicatedInvalid,
  WriteInRecordAdjudicatedOfficialCandidate,
  WriteInRecordAdjudicatedWriteInCandidate,
  WriteInRecordPending,
  WriteInSummaryEntry,
  WriteInSummaryEntryAdjudicatedInvalid,
  WriteInSummaryEntryAdjudicatedOfficialCandidate,
  WriteInSummaryEntryAdjudicatedWriteInCandidate,
  WriteInSummaryEntryPending,
} from './types';
import {
  areCastVoteRecordMetadataEqual,
  cvrBallotTypeToLegacyBallotType,
} from './util/cvrs';

/**
 * Path to the store's schema file, i.e. the file that defines the database.
 */
const SchemaPath = join(__dirname, '../schema.sql');

function convertSqliteTimestampToIso8601(
  sqliteTimestamp: string
): Iso8601Timestamp {
  return new Date(sqliteTimestamp).toISOString();
}

/**
 * Manages a data store for imported election data, cast vote records, and
 * transcribed and adjudicated write-ins.
 */
export class Store {
  private constructor(private readonly client: DbClient) {}

  getDbPath(): string {
    return this.client.getDatabasePath();
  }

  /**
   * Builds and returns a new store whose data is kept in memory.
   */
  static memoryStore(): Store {
    return new Store(DbClient.memoryClient(SchemaPath));
  }

  /**
   * Builds and returns a new store at `dbPath`.
   */
  static fileStore(dbPath: string): Store {
    return new Store(DbClient.fileClient(dbPath, SchemaPath));
  }

  /**
   * Runs the given function in a transaction. If the function throws an error,
   * the transaction is rolled back. Otherwise, the transaction is committed.
   *
   * If the function returns a `Result` type, the transaction will only be be
   * rolled back if the returned `Result` is an error.
   *
   * Returns the result of the function.
   */
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;
  withTransaction<T>(fn: () => T): T {
    return this.client.transaction(fn, (result: T) => {
      if (isResult(result)) {
        return result.isOk();
      }

      return true;
    });
  }

  /**
   * Creates an election record and returns its ID.
   */
  addElection(electionData: string): Id {
    const id = uuid();
    this.client.run(
      'insert into elections (id, data) values (?, ?)',
      id,
      electionData
    );
    return id;
  }

  /**
   * Gets all election records.
   */
  getElections(): ElectionRecord[] {
    return (
      this.client.all(`
      select
        id,
        data as electionData,
        datetime(created_at, 'localtime') as createdAt,
        is_official_results as isOfficialResults
      from elections
      where deleted_at is null
    `) as Array<{
        id: Id;
        electionData: string;
        createdAt: string;
        isOfficialResults: 0 | 1;
      }>
    ).map((r) => ({
      id: r.id,
      electionDefinition: safeParseElectionDefinition(
        r.electionData
      ).unsafeUnwrap(),
      createdAt: convertSqliteTimestampToIso8601(r.createdAt),
      isOfficialResults: r.isOfficialResults === 1,
    }));
  }

  /**
   * Gets a specific election record.
   */
  getElection(electionId: string): ElectionRecord | undefined {
    const result = this.client.one(
      `
      select
        id,
        data as electionData,
        datetime(created_at, 'localtime') as createdAt,
        is_official_results as isOfficialResults
      from elections
      where deleted_at is null AND id = ?
    `,
      electionId
    ) as
      | {
          id: Id;
          electionData: string;
          createdAt: string;
          isOfficialResults: 0 | 1;
        }
      | undefined;
    if (!result) {
      return undefined;
    }
    return {
      id: result.id,
      electionDefinition: safeParseElectionDefinition(
        result.electionData
      ).unsafeUnwrap(),
      createdAt: convertSqliteTimestampToIso8601(result.createdAt),
      isOfficialResults: result.isOfficialResults === 1,
    };
  }

  /**
   * Deletes an election record.
   */
  deleteElection(id: Id): void {
    this.client.run(
      'update elections set deleted_at = current_timestamp where id = ?',
      id
    );
  }

  /**
   * Asserts that an election with the given ID exists and is not deleted.
   */
  assertElectionExists(electionId: Id): void {
    const election = this.client.one(
      `
        select id from elections
        where id = ? and deleted_at is null
      `,
      electionId
    ) as { id: Id } | undefined;

    if (!election) {
      throw new Error(`Election not found: ${electionId}`);
    }
  }

  /**
   * Sets the id for the current election
   */
  setCurrentElectionId(currentElectionId?: Id): void {
    if (currentElectionId) {
      this.client.run(
        'update settings set current_election_id = ?',
        currentElectionId
      );
    } else {
      this.client.run('update settings set current_election_id = NULL');
    }
  }

  /**
   * Gets the id for the current election
   */
  getCurrentElectionId(): Optional<Id> {
    const settings = this.client.one(
      `
      select current_election_id as currentElectionId from settings
    `
    ) as { currentElectionId: Id } | null;

    return settings?.currentElectionId ?? undefined;
  }

  /**
   * Creates a system settings record and returns its ID.
   * Note `system_settings` are logical settings that span other machines eg. VxScan.
   * `settings` are local to VxAdmin
   */
  saveSystemSettings(systemSettings: SystemSettings): void {
    this.client.run('delete from system_settings');
    this.client.run(
      `
      insert into system_settings (
        are_poll_worker_card_pins_enabled,
        inactive_session_time_limit_minutes,
        num_incorrect_pin_attempts_allowed_before_card_lockout,
        overall_session_time_limit_hours,
        starting_card_lockout_duration_seconds
      ) values (
        ?, ?, ?, ?, ?
      )
      `,
      systemSettings.arePollWorkerCardPinsEnabled ? 1 : 0,
      systemSettings.inactiveSessionTimeLimitMinutes,
      systemSettings.numIncorrectPinAttemptsAllowedBeforeCardLockout,
      systemSettings.overallSessionTimeLimitHours,
      systemSettings.startingCardLockoutDurationSeconds
    );
  }

  /**
   * Gets a specific system settings record.
   */
  getSystemSettings(): SystemSettings | undefined {
    const result = this.client.one(
      `
      select
        are_poll_worker_card_pins_enabled as arePollWorkerCardPinsEnabled,
        inactive_session_time_limit_minutes as inactiveSessionTimeLimitMinutes,
        num_incorrect_pin_attempts_allowed_before_card_lockout as numIncorrectPinAttemptsAllowedBeforeCardLockout,
        overall_session_time_limit_hours as overallSessionTimeLimitHours,
        starting_card_lockout_duration_seconds as startingCardLockoutDurationSeconds
      from system_settings
      `
    ) as SystemSettingsDbRow | undefined;

    if (!result) {
      return undefined;
    }
    return {
      ...result,
      arePollWorkerCardPinsEnabled: result.arePollWorkerCardPinsEnabled === 1,
    };
  }

  getCastVoteRecordFileByHash(
    electionId: Id,
    sha256Hash: string
  ): Optional<Id> {
    return (
      this.client.one(
        `
        select id
        from cvr_files
        where election_id = ?
          and sha256_hash = ?
      `,
        electionId,
        sha256Hash
      ) as { id: Id } | undefined
    )?.id;
  }

  getCastVoteRecordCountByFileId(fileId: Id): number {
    return (
      this.client.one(
        `
          select count(cvr_id) as alreadyPresent
          from cvr_file_entries
          where cvr_file_id = ?
        `,
        fileId
      ) as { alreadyPresent: number }
    ).alreadyPresent;
  }

  addInitialCastVoteRecordFileRecord({
    id,
    electionId,
    isTestMode,
    filename,
    exportedTimestamp,
    sha256Hash,
  }: {
    id: Id;
    electionId: Id;
    isTestMode: boolean;
    filename: string;
    exportedTimestamp: Iso8601Timestamp;
    sha256Hash: string;
  }): void {
    this.client.run(
      `
        insert into cvr_files (
          id,
          election_id,
          is_test_mode,
          filename,
          export_timestamp,
          precinct_ids,
          scanner_ids,
          sha256_hash
        ) values (
          ?, ?, ?, ?, ?, ?, ?, ?
        )
      `,
      id,
      electionId,
      isTestMode ? 1 : 0,
      filename,
      exportedTimestamp,
      JSON.stringify([]),
      JSON.stringify([]),
      sha256Hash
    );
  }

  updateCastVoteRecordFileRecord({
    id,
    precinctIds,
    scannerIds,
  }: {
    id: Id;
    precinctIds: Set<string>;
    scannerIds: Set<string>;
  }): void {
    this.client.run(
      `
        update cvr_files
        set
          precinct_ids = ?,
          scanner_ids = ?
        where id = ?
      `,
      JSON.stringify([...precinctIds]),
      JSON.stringify([...scannerIds]),
      id
    );
  }

  /**
   * Adds a CVR file entry record and returns its ID. If a CVR file entry with
   * the same contents has already been added, returns the ID of that record and
   * merely associates `cvrFileId` with it.
   */
  addCastVoteRecordFileEntry({
    electionId,
    cvrFileId,
    ballotId,
    metadata,
    votes,
  }: {
    electionId: Id;
    cvrFileId: Id;
    ballotId: BallotId;
    metadata: CastVoteRecordMetadata;
    votes: string;
  }): Result<
    { cvrId: Id; isNew: boolean },
    {
      type: 'ballot-id-already-exists-with-different-data';
    }
  > {
    const existingCvr = this.client.one(
      `
        select
          id,
          ballot_style_id as ballotStyleId,
          ballot_type as ballotType,
          batch_id as batchId,
          precinct_id as precinctId,
          sheet_number as sheetNumber,
          votes as votes
        from cvrs
        where
          election_id = ? and
          ballot_id = ?
      `,
      electionId,
      ballotId
    ) as
      | {
          id: Id;
          ballotStyleId: string;
          ballotType: string;
          batchId: string;
          precinctId: string;
          sheetNumber: number | null;
          votes: string;
        }
      | undefined;

    const cvrId = existingCvr?.id ?? uuid();
    if (existingCvr) {
      const existingCvrMetadata: CastVoteRecordMetadata = {
        ballotStyleId: existingCvr.ballotStyleId,
        ballotType: existingCvr.ballotType as CVR.vxBallotType,
        batchId: existingCvr.batchId,
        precinctId: existingCvr.precinctId,
        sheetNumber: existingCvr.sheetNumber || undefined,
      };

      // Existing cast vote records are expected, but existing cast vote records
      // with new data indicate a bad or inappropriately manipulated file
      if (
        !areCastVoteRecordMetadataEqual(metadata, existingCvrMetadata) ||
        votes !== existingCvr.votes
      ) {
        return err({
          type: 'ballot-id-already-exists-with-different-data',
        });
      }
    } else {
      // Insert new cast vote record metadata and votes
      this.client.run(
        `
        insert into cvrs (
          id,
          election_id,
          ballot_id,
          ballot_style_id,
          ballot_type,
          batch_id,
          precinct_id,
          sheet_number,
          votes
        ) values (
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `,
        cvrId,
        electionId,
        ballotId,
        metadata.ballotStyleId,
        metadata.ballotType,
        metadata.batchId,
        metadata.precinctId,
        metadata.sheetNumber || null,
        votes
      );
    }

    // Whether the cast vote record itself is new or not, associate it with the new file.
    this.client.run(
      `
        insert or ignore into cvr_file_entries (
          cvr_file_id,
          cvr_id
        ) values (
          ?, ?
        )
      `,
      cvrFileId,
      cvrId
    );

    return ok({ cvrId, isNew: !existingCvr });
  }

  addBallotImage({
    cvrId,
    imageData,
    pageLayout,
    side,
  }: {
    cvrId: Id;
    imageData: Buffer;
    pageLayout: BallotPageLayout;
    side: Side;
  }): void {
    this.client.run(
      `
      insert into ballot_images (
        cvr_id,
        side,
        image,
        layout
      ) values (
        ?, ?, ?, ?
      )
    `,
      cvrId,
      side,
      imageData,
      JSON.stringify(pageLayout)
    );
  }

  addScannerBatch(scannerBatch: ScannerBatch): void {
    this.client.run(
      `
      insert or ignore into scanner_batches (
        id,
        label,
        scanner_id,
        election_id
      ) values (
        ?, ?, ?, ?
      )
    `,
      scannerBatch.batchId,
      scannerBatch.label,
      scannerBatch.scannerId,
      scannerBatch.electionId
    );
  }

  getScannerBatches(electionId: string): ScannerBatch[] {
    return this.client.all(
      `
        select
          id as batchId,
          label as label,
          scanner_id as scannerId,
          election_id as electionId
        from scanner_batches
        where
          election_id = ?
      `,
      electionId
    ) as ScannerBatch[];
  }

  deleteEmptyScannerBatches(electionId: string): void {
    this.client.run(
      `
        delete from scanner_batches
        where election_id = ?
          and not exists (
          select 1 from cvrs where id = cvrs.batch_id
        )
      `,
      electionId
    );
  }

  /**
   * Returns the current CVR file mode for the current election.
   */
  getCurrentCvrFileModeForElection(electionId: Id): CvrFileMode {
    const sampleCastVoteRecordFile = this.client.one(
      `
        select
          is_test_mode as isTestMode
        from cvr_files
        where
          election_id = ?
      `,
      electionId
    ) as { isTestMode: number } | undefined;

    if (!sampleCastVoteRecordFile) {
      return 'unlocked';
    }

    return sampleCastVoteRecordFile.isTestMode ? 'test' : 'official';
  }

  /**
   * Adds a write-in and returns its ID. Used when loading cast vote records.
   */
  addWriteIn({
    castVoteRecordId,
    side,
    contestId,
    optionId,
  }: {
    castVoteRecordId: Id;
    side: Side;
    contestId: Id;
    optionId: Id;
  }): Id {
    const id = uuid();

    this.client.run(
      `
        insert into write_ins (
          id,
          cvr_id,
          side,
          contest_id,
          option_id
        ) values (
          ?, ?, ?, ?, ?
        )
      `,
      id,
      castVoteRecordId,
      side,
      contestId,
      optionId
    );

    return id;
  }

  /**
   * Returns the data necessary to display a single write-in.
   */
  getWriteInWithDetails(writeInId: Id): {
    writeInId: Id;
    contestId: ContestId;
    optionId: ContestOptionId;
    image: Buffer;
    layout: BallotPageLayout;
    castVoteRecordId: Id;
    castVoteRecordVotes: DatabaseSerializedCastVoteRecordVotes;
  } {
    const writeInWithDetails = this.client.one(
      `
        select
          write_ins.id as writeInId,
          write_ins.contest_id as contestId,
          write_ins.option_id as optionId,
          ballot_images.image as image,
          ballot_images.layout as layout,
          cvrs.votes as castVoteRecordVotes,
          write_ins.cvr_id as castVoteRecordId
        from write_ins
        inner join
          ballot_images on 
            write_ins.cvr_id = ballot_images.cvr_id and 
            write_ins.side = ballot_images.side
        inner join
          cvrs on
            write_ins.cvr_id = cvrs.id
        where write_ins.id = ?
      `,
      writeInId
    ) as
      | {
          writeInId: Id;
          contestId: ContestId;
          optionId: ContestOptionId;
          image: Buffer;
          layout: string;
          castVoteRecordVotes: string;
          castVoteRecordId: string;
        }
      | undefined;

    assert(writeInWithDetails, 'write-in does not exist');

    return {
      ...writeInWithDetails,
      layout: safeParseJson(
        writeInWithDetails.layout,
        BallotPageLayoutSchema
      ).unsafeUnwrap(),
      castVoteRecordVotes: safeParseJson(
        writeInWithDetails.castVoteRecordVotes,
        DatabaseSerializedCastVoteRecordVotesSchema
      ).unsafeUnwrap(),
    };
  }

  getCvrFiles(electionId: Id): CastVoteRecordFileRecord[] {
    const results = this.client.all(
      `
      select
        cvr_files.id as id,
        filename,
        export_timestamp as exportTimestamp,
        count(cvr_id) as numCvrsImported,
        precinct_ids as precinctIds,
        scanner_ids as scannerIds,
        sha256_hash as sha256Hash,
        datetime(cvr_files.created_at, 'localtime') as createdAt
      from cvr_files
      join (
        select
          cvr_file_entries.cvr_id,
          min(cvr_files.created_at) as min_import_date,
          cvr_file_entries.cvr_file_id
        from cvr_file_entries, cvr_files
        group by cvr_file_entries.cvr_id
      ) cvrs_by_min_import_date on
        cvrs_by_min_import_date.cvr_file_id = cvr_files.id
      where cvr_files.election_id = ?
      group by cvr_files.id
      order by export_timestamp desc
    `,
      electionId
    ) as Array<{
      id: Id;
      filename: string;
      exportTimestamp: string;
      numCvrsImported: number;
      precinctIds: string;
      scannerIds: string;
      sha256Hash: string;
      createdAt: string;
    }>;

    return results
      .map((result) =>
        safeParse(CastVoteRecordFileRecordSchema, {
          id: result.id,
          electionId,
          sha256Hash: result.sha256Hash,
          filename: result.filename,
          exportTimestamp: convertSqliteTimestampToIso8601(
            result.exportTimestamp
          ),
          numCvrsImported: result.numCvrsImported,
          precinctIds: safeParseJson(result.precinctIds).unsafeUnwrap(),
          scannerIds: safeParseJson(result.scannerIds).unsafeUnwrap(),
          createdAt: convertSqliteTimestampToIso8601(result.createdAt),
        }).unsafeUnwrap()
      )
      .map<CastVoteRecordFileRecord>((parsedResult) => ({
        ...parsedResult,
        precinctIds: [...parsedResult.precinctIds].sort(),
        scannerIds: [...parsedResult.scannerIds].sort(),
      }));
  }

  /**
   * Gets all CVR entries for an election.
   */
  getCastVoteRecordEntries(electionId: Id): CastVoteRecordFileEntryRecord[] {
    const fileMode = this.getCurrentCvrFileModeForElection(electionId);
    if (fileMode === 'unlocked') return [];
    const isTestMode = fileMode === 'test';

    const entries = this.client.all(
      `
        select
          cvrs.id as id,
          cvrs.ballot_id as ballotId,
          cvrs.ballot_style_id as ballotStyleId,
          cvrs.ballot_type as ballotType,
          cvrs.batch_id as batchId,
          scanner_batches.label as batchLabel,
          scanner_batches.scanner_id as scannerId,
          cvrs.precinct_id as precinctId,
          cvrs.sheet_number as sheetNumber,
          cvrs.votes as votes,
          datetime(cvrs.created_at, 'localtime') as createdAt
        from
          cvrs inner join scanner_batches on cvrs.batch_id = scanner_batches.id
        where cvrs.election_id = ?
        order by cvrs.created_at asc
      `,
      electionId
    ) as Array<{
      id: Id;
      ballotId: string;
      ballotStyleId: string;
      ballotType: string;
      batchId: string;
      batchLabel: string;
      precinctId: string;
      scannerId: string;
      sheetNumber: number | null;
      votes: string;
      createdAt: Iso8601Timestamp;
    }>;

    return entries.map((entry) => {
      const castVoteRecordLegacyMetadata: CastVoteRecord = {
        _precinctId: entry.precinctId,
        _scannerId: entry.scannerId,
        _batchId: entry.batchId,
        _batchLabel: entry.batchLabel,
        _ballotStyleId: entry.ballotStyleId,
        _ballotType: cvrBallotTypeToLegacyBallotType(
          entry.ballotType as CVR.vxBallotType
        ),
        _testBallot: isTestMode,
      };
      return {
        id: entry.id,
        ballotId: entry.ballotId,
        electionId,
        data: JSON.stringify({
          ...castVoteRecordLegacyMetadata,
          ...JSON.parse(entry.votes),
        }),
        createdAt: convertSqliteTimestampToIso8601(entry.createdAt),
      };
    });
  }

  /**
   * Deletes all CVR files for an election.
   */
  deleteCastVoteRecordFiles(electionId: Id): void {
    this.client.transaction(() => {
      this.client.run(
        `
          delete from cvr_file_entries
          where cvr_file_id in (
            select id from cvr_files where election_id = ?
          )
        `,
        electionId
      );
      this.client.run(
        `
          delete from cvr_files
          where election_id = ?
        `,
        electionId
      );
      this.client.run(
        `
          delete from cvrs
          where not exists (
            select 1 from cvr_file_entries where cvr_id = cvrs.id
          )
        `
      );
      this.client.run(
        `
          delete from write_in_candidates
          where election_id = ?
        `,
        electionId
      );
      this.deleteEmptyScannerBatches(electionId);
    });
  }

  getWriteInCandidates({
    electionId,
    contestId,
  }: {
    electionId: Id;
    contestId?: ContestId;
  }): WriteInCandidateRecord[] {
    const whereParts: string[] = ['election_id = ?'];
    const params: Bindable[] = [electionId];

    if (contestId) {
      whereParts.push('contest_id = ?');
      params.push(contestId);
    }

    const rows = this.client.all(
      `
        select
          id,
          contest_id as contestId,
          name as name
        from write_in_candidates
        where ${whereParts.join(' and ')}
      `,
      ...params
    ) as Array<{
      id: Id;
      contestId: ContestId;
      name: string;
    }>;

    return rows.map((row) => ({
      electionId,
      ...row,
    }));
  }

  addWriteInCandidate({
    electionId,
    contestId,
    name,
  }: Omit<WriteInCandidateRecord, 'id'>): WriteInCandidateRecord {
    const id = uuid();

    this.client.run(
      `
        insert into write_in_candidates 
          (id, election_id, contest_id, name)
        values
          (?, ?, ?, ?)
      `,
      id,
      electionId,
      contestId,
      name
    );

    return {
      id,
      electionId,
      contestId,
      name,
    };
  }

  private deleteWriteInCandidateIfChildless(id: Id): void {
    const adjudicatedWriteIn = this.client.one(
      `
      select id
      from write_ins
      where write_in_candidate_id = ?
    `,
      id
    ) as { id: Id } | undefined;

    if (!adjudicatedWriteIn) {
      this.client.run(
        `
        delete from write_in_candidates
        where id = ?
      `,
        id
      );
    }
  }

  /**
   * Gets a summary of the write-in adjudication status.
   */
  getWriteInAdjudicationSummary({
    electionId,
    contestId,
    status,
  }: {
    electionId: Id;
    contestId?: ContestId;
    status?: WriteInAdjudicationStatus;
  }): WriteInSummaryEntry[] {
    const whereParts: string[] = ['cvrs.election_id = ?'];
    const params: Bindable[] = [electionId];

    if (contestId) {
      whereParts.push('write_ins.contest_id = ?');
      params.push(contestId);
    }

    if (status === 'adjudicated') {
      whereParts.push(
        '(write_ins.official_candidate_id is not null or write_ins.write_in_candidate_id is not null or write_ins.is_invalid = 1)'
      );
    }

    if (status === 'pending') {
      whereParts.push('write_ins.official_candidate_id is null');
      whereParts.push('write_ins.write_in_candidate_id is null');
      whereParts.push('write_ins.is_invalid = 0');
    }

    const rows = this.client.all(
      `
        select
          write_ins.contest_id as contestId,
          write_ins.official_candidate_id as officialCandidateId,
          write_ins.write_in_candidate_id as writeInCandidateId,
          write_ins.is_invalid as isInvalid,
          count(write_ins.id) as writeInCount
        from write_ins
        inner join
          cvrs on write_ins.cvr_id = cvrs.id
        where ${whereParts.join(' and ')}
        group by 
          write_ins.contest_id,
          write_ins.official_candidate_id,
          write_ins.write_in_candidate_id,
          write_ins.is_invalid
      `,
      ...params
    ) as Array<{
      contestId: ContestId;
      isInvalid: boolean;
      officialCandidateId: string | null;
      writeInCandidateId: string | null;
      writeInCount: number;
    }>;
    if (rows.length === 0) {
      return [];
    }

    const officialCandidates = assertDefined(
      this.getElection(assertDefined(this.getCurrentElectionId()))
    )
      .electionDefinition.election.contests.filter(
        (contest): contest is CandidateContest => contest.type === 'candidate'
      )
      .flatMap((contest) => {
        return contest.candidates
          .filter((candidate) => !candidate.isWriteIn)
          .map((candidate) => ({ contestId: contest.id, ...candidate }));
      });

    const writeInCandidates = this.getWriteInCandidates({
      electionId,
    });

    return rows.map((row): WriteInSummaryEntry => {
      if (row.officialCandidateId) {
        return typedAs<WriteInSummaryEntryAdjudicatedOfficialCandidate>({
          status: 'adjudicated',
          adjudicationType: 'official-candidate',
          contestId: row.contestId,
          writeInCount: row.writeInCount,
          candidateId: row.officialCandidateId,
          candidateName: find(
            officialCandidates,
            (candidate) =>
              candidate.id === row.officialCandidateId &&
              candidate.contestId === row.contestId
          ).name,
        });
      }

      if (row.writeInCandidateId) {
        return typedAs<WriteInSummaryEntryAdjudicatedWriteInCandidate>({
          status: 'adjudicated',
          adjudicationType: 'write-in-candidate',
          contestId: row.contestId,
          writeInCount: row.writeInCount,
          candidateId: row.writeInCandidateId,
          candidateName: find(
            writeInCandidates,
            (candidate) =>
              candidate.id === row.writeInCandidateId &&
              candidate.contestId === row.contestId
          ).name,
        });
      }

      if (row.isInvalid) {
        return typedAs<WriteInSummaryEntryAdjudicatedInvalid>({
          status: 'adjudicated',
          adjudicationType: 'invalid',
          contestId: row.contestId,
          writeInCount: row.writeInCount,
        });
      }

      return typedAs<WriteInSummaryEntryPending>({
        status: 'pending',
        contestId: row.contestId,
        writeInCount: row.writeInCount,
      });
    });
  }

  /**
   * Gets write-in records filtered by the given options.
   */
  getWriteInRecords({
    electionId,
    contestId,
    castVoteRecordId,
    writeInId,
    status,
    limit,
  }: {
    electionId: Id;
    contestId?: ContestId;
    castVoteRecordId?: Id;
    writeInId?: Id;
    status?: WriteInAdjudicationStatus;
    limit?: number;
  }): WriteInRecord[] {
    this.assertElectionExists(electionId);

    const whereParts: string[] = ['cvr_files.election_id = ?'];
    const params: Bindable[] = [electionId];

    if (contestId) {
      whereParts.push('write_ins.contest_id = ?');
      params.push(contestId);
    }

    if (castVoteRecordId) {
      whereParts.push('write_ins.cvr_id = ?');
      params.push(castVoteRecordId);
    }

    if (writeInId) {
      whereParts.push('write_ins.id = ?');
      params.push(writeInId);
    }

    if (status === 'adjudicated') {
      whereParts.push(
        '(write_ins.official_candidate_id is not null or write_ins.write_in_candidate_id is not null or write_ins.is_invalid = 1)'
      );
    } else if (status === 'pending') {
      whereParts.push('write_ins.official_candidate_id is null');
      whereParts.push('write_ins.write_in_candidate_id is null');
      whereParts.push('write_ins.is_invalid = 0');
    }

    if (typeof limit === 'number') {
      params.push(limit);
    }

    const writeInRows = this.client.all(
      `
        select distinct
          write_ins.id as id,
          write_ins.cvr_id as castVoteRecordId,
          write_ins.contest_id as contestId,
          write_ins.option_id as optionId,
          write_ins.official_candidate_id as officialCandidateId,
          write_ins.write_in_candidate_id as writeInCandidateId,
          write_ins.is_invalid as isInvalid,
          datetime(write_ins.adjudicated_at, 'localtime') as adjudicatedAt
        from write_ins
        inner join
          cvr_file_entries on write_ins.cvr_id = cvr_file_entries.cvr_id
        inner join
          cvr_files on cvr_file_entries.cvr_file_id = cvr_files.id
        where
          ${whereParts.join(' and ')}
        order by
          write_ins.cvr_id,
          write_ins.option_id
        ${typeof limit === 'number' ? 'limit ?' : ''}
      `,
      ...params
    ) as Array<{
      id: Id;
      castVoteRecordId: Id;
      contestId: ContestId;
      optionId: ContestOptionId;
      isInvalid: boolean;
      officialCandidateId: string | null;
      writeInCandidateId: Id | null;
      adjudicatedAt: Iso8601Timestamp | null;
    }>;

    return writeInRows
      .map((row) => {
        if (row.officialCandidateId) {
          return typedAs<WriteInRecordAdjudicatedOfficialCandidate>({
            id: row.id,
            castVoteRecordId: row.castVoteRecordId,
            contestId: row.contestId,
            optionId: row.optionId,
            status: 'adjudicated',
            adjudicationType: 'official-candidate',
            candidateId: row.officialCandidateId,
          });
        }

        if (row.writeInCandidateId) {
          return typedAs<WriteInRecordAdjudicatedWriteInCandidate>({
            id: row.id,
            castVoteRecordId: row.castVoteRecordId,
            contestId: row.contestId,
            optionId: row.optionId,
            status: 'adjudicated',
            adjudicationType: 'write-in-candidate',
            candidateId: row.writeInCandidateId,
          });
        }

        if (row.isInvalid) {
          return typedAs<WriteInRecordAdjudicatedInvalid>({
            id: row.id,
            castVoteRecordId: row.castVoteRecordId,
            contestId: row.contestId,
            optionId: row.optionId,
            status: 'adjudicated',
            adjudicationType: 'invalid',
          });
        }

        return typedAs<WriteInRecordPending>({
          id: row.id,
          status: 'pending',
          castVoteRecordId: row.castVoteRecordId,
          contestId: row.contestId,
          optionId: row.optionId,
        });
      })
      .filter((writeInRecord) => writeInRecord.status === status || !status);
  }

  /**
   * Adjudicates a write-in.
   */
  adjudicateWriteIn(adjudicationAction: WriteInAdjudicationAction): void {
    const [initialWriteInRecord] = this.getWriteInRecords({
      electionId: assertDefined(this.getCurrentElectionId()),
      writeInId: adjudicationAction.writeInId,
    });
    assert(initialWriteInRecord, 'write-in record does not exist');

    const params =
      adjudicationAction.type === 'invalid'
        ? [adjudicationAction.writeInId]
        : [adjudicationAction.candidateId, adjudicationAction.writeInId];

    this.client.run(
      `
        update write_ins
        set 
          is_invalid = ${adjudicationAction.type === 'invalid' ? 1 : 0}, 
          official_candidate_id = ${
            adjudicationAction.type === 'official-candidate' ? '?' : 'null'
          }, 
          write_in_candidate_id = ${
            adjudicationAction.type === 'write-in-candidate' ? '?' : 'null'
          }, 
          adjudicated_at = current_timestamp
        where id = ?
      `,
      ...params
    );

    // if we are switching away from a write-in candidate, we may have to clean
    // up the record if it has no references
    if (
      initialWriteInRecord.status === 'adjudicated' &&
      initialWriteInRecord.adjudicationType === 'write-in-candidate'
    ) {
      this.deleteWriteInCandidateIfChildless(initialWriteInRecord.candidateId);
    }
  }

  /**
   * Sets whether the election with the given ID has had results marked official.
   */
  setElectionResultsOfficial(electionId: Id, isOfficialResults: boolean): void {
    this.client.run(
      `
        update elections
        set is_official_results = ?
        where id = ?
      `,
      isOfficialResults ? 1 : 0,
      electionId
    );
  }

  /* istanbul ignore next - debug purposes only */
  getDebugSummary(): Map<string, number> {
    const tableNameRows = this.client.all(
      `select name from sqlite_schema where type='table' order by name;`
    ) as Array<{ name: string }>;

    return new Map<string, number>(
      tableNameRows.map(
        (row) =>
          [
            row.name,
            (
              this.client.one(`select count(*) as count from ${row.name}`) as {
                count: number;
              }
            ).count,
          ] as const
      )
    );
  }
}
