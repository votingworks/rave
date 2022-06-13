//
// The durable datastore for election data, CVRs, and adjudication info.
//

import { Adjudication } from '@votingworks/types';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { DbClient } from './db_client';

const SchemaPath = join(__dirname, '../schema.sql');

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
   * Adds an adjudication and returns its id.
   */
  addAdjudication(contestId: string, transcribedValue = ''): string {
    const id = uuid();
    this.client.run(
      'insert into adjudications (id, contest_id, transcribed_value) values (?, ?, ?)',
      id,
      contestId,
      transcribedValue
    );
    return id;
  }

  /** Updates an adjudication's transcribedValue. */
  updateAdjudicationTranscribedValue(
    adjudicationId: string,
    transcribedValue: string
  ): void {
    this.client.run(
      'update adjudications set transcribed_value = ? where id = ?',
      transcribedValue,
      adjudicationId
    );
  }

  /**
   * Gets an adjudication by its id.
   */
  getAdjudicationById(id: string): Adjudication | undefined {
    const row = this.client.one(
      'select id, contest_id as contestId, transcribed_value as transcribedValue from adjudications where id = ?',
      id
    ) as Adjudication | undefined;
    return row;
  }
}
