import { Admin } from '@votingworks/api';
import {
  electionMinimalExhaustiveSampleDefinition,
  electionMinimalExhaustiveSampleFixtures,
  electionWithMsEitherNeitherDefinition,
} from '@votingworks/fixtures';
import { fakeLogger } from '@votingworks/logging';
import { MemoryStorage, typedAs } from '@votingworks/utils';
import fetchMock from 'fetch-mock';
import {
  currentElectionIdStorageKey,
  ElectionManagerStoreAdminBackend,
} from './admin_backend';

const getElectionsResponse: Admin.GetElectionsResponse = [
  {
    id: 'test-election-1',
    electionDefinition: electionWithMsEitherNeitherDefinition,
    createdAt: '2021-01-01T00:00:00.000Z',
    isOfficialResults: false,
  },
  {
    id: 'test-election-2',
    electionDefinition: electionMinimalExhaustiveSampleDefinition,
    createdAt: '2022-01-01T00:00:00.000Z',
    isOfficialResults: false,
  },
];

beforeEach(() => {
  fetchMock.reset();
});

test('load election without a current election ID', async () => {
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  fetchMock.reset().get('/admin/elections', {
    body: getElectionsResponse,
  });

  await expect(backend.loadCurrentElectionMetadata()).resolves.toBeUndefined();
});

test('load election with a current election ID', async () => {
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  await storage.set(currentElectionIdStorageKey, 'test-election-2');
  fetchMock.reset().get('/admin/elections', {
    body: getElectionsResponse,
  });

  await expect(backend.loadCurrentElectionMetadata()).resolves.toStrictEqual(
    expect.objectContaining(
      typedAs<Partial<Admin.ElectionRecord>>({
        electionDefinition: electionMinimalExhaustiveSampleDefinition,
        createdAt: '2022-01-01T00:00:00.000Z',
      })
    )
  );
});

test('load election HTTP error', async () => {
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  await storage.set(currentElectionIdStorageKey, 'test-election-1');
  fetchMock.reset().get('/admin/elections', 500);

  await expect(backend.loadCurrentElectionMetadata()).rejects.toThrowError();
});

test('load election invalid response', async () => {
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  await storage.set(currentElectionIdStorageKey, 'test-election-1');
  fetchMock.reset().get('/admin/elections', [{ invalid: 'response' }]);

  await expect(backend.loadCurrentElectionMetadata()).rejects.toThrowError();
});

test('configure with invalid election definition', async () => {
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });
  await expect(backend.configure('')).rejects.toThrowError();
});

test('configure HTTP error', async () => {
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  fetchMock.reset().post('/admin/elections', 500);

  await expect(
    backend.configure(electionWithMsEitherNeitherDefinition.electionData)
  ).rejects.toThrowError();
});

test('configure invalid response', async () => {
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  fetchMock.reset().post('/admin/elections', { invalid: 'response' });

  await expect(
    backend.configure(electionWithMsEitherNeitherDefinition.electionData)
  ).rejects.toThrowError();
});

test('configure errors response', async () => {
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  fetchMock.reset().post('/admin/elections', {
    body: typedAs<Admin.PostElectionResponse>({
      status: 'error',
      errors: [
        { type: 'invalid', message: 'invalid election' },
        { type: 'another', message: 'I do not like you' },
      ],
    }),
  });

  await expect(
    backend.configure(electionWithMsEitherNeitherDefinition.electionData)
  ).rejects.toThrowError('invalid election, I do not like you');
});

test('addCastVoteRecordFile happy path', async () => {
  const { partial1CvrFile } = electionMinimalExhaustiveSampleFixtures;
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  await storage.set(currentElectionIdStorageKey, 'test-election-2');
  fetchMock.get('/admin/elections', { body: getElectionsResponse });

  const apiResponse: Admin.PostCvrFileResponse = {
    status: 'ok',
    id: 'cvr-file-1',
    alreadyPresent: 10,
    newlyAdded: 450,
    wasExistingFile: false,
  };
  fetchMock.post(`/admin/elections/test-election-2/cvr-files?`, apiResponse);

  await expect(backend.loadCastVoteRecordFiles()).resolves.toBeUndefined();

  await expect(
    backend.addCastVoteRecordFile(
      new File([partial1CvrFile.asBuffer()], 'cvrs.jsonl')
    )
  ).resolves.toEqual({
    alreadyPresent: 10,
    newlyAdded: 450,
    wasExistingFile: false,
  });

  const cvrFilesFromStorage = await backend.loadCastVoteRecordFiles();
  expect(cvrFilesFromStorage).not.toBeUndefined();
  expect(cvrFilesFromStorage?.fileList.length).toBeGreaterThan(0);
});

test('addCastVoteRecordFile analyze only', async () => {
  const { partial1CvrFile } = electionMinimalExhaustiveSampleFixtures;
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  await storage.set(currentElectionIdStorageKey, 'test-election-2');

  const apiResponse: Admin.PostCvrFileResponse = {
    status: 'ok',
    id: 'cvr-file-1',
    alreadyPresent: 10,
    newlyAdded: 450,
    wasExistingFile: false,
  };
  fetchMock.post(
    `/admin/elections/test-election-2/cvr-files?analyzeOnly=true`,
    apiResponse
  );

  await expect(backend.loadCastVoteRecordFiles()).resolves.toBeUndefined();

  await expect(
    backend.addCastVoteRecordFile(
      new File([partial1CvrFile.asBuffer()], 'cvrs.jsonl'),
      { analyzeOnly: true }
    )
  ).resolves.toEqual({
    alreadyPresent: 10,
    newlyAdded: 450,
    wasExistingFile: false,
  });

  await expect(backend.loadCastVoteRecordFiles()).resolves.toBeUndefined();
});

test('addCastVoteRecordFile handles api errors', async () => {
  const { partial1CvrFile } = electionMinimalExhaustiveSampleFixtures;
  const storage = new MemoryStorage();
  const logger = fakeLogger();
  const backend = new ElectionManagerStoreAdminBackend({ storage, logger });

  await storage.set(currentElectionIdStorageKey, 'test-election-2');
  fetchMock.get('/admin/elections', { body: getElectionsResponse });

  await storage.set(currentElectionIdStorageKey, 'test-election-id');

  const apiError: Admin.PostCvrFileResponse = {
    status: 'error',
    errors: [{ type: 'oops', message: 'that was unexpected' }],
  };
  fetchMock.post(`/admin/elections/test-election-id/cvr-files?`, apiError);

  await expect(
    backend.addCastVoteRecordFile(
      new File([partial1CvrFile.asBuffer()], 'cvrs.jsonl')
    )
  ).rejects.toThrow(/that was unexpected/);
});
