import React, { useContext, useState } from 'react';
import moment from 'moment';

import { Admin } from '@votingworks/api';
import { format, isElectionManagerAuth } from '@votingworks/utils';
import { assert, find } from '@votingworks/basics';
import { Button, Prose, Table, TD, Text, LinkButton } from '@votingworks/ui';
import { ResultsFileType } from '../config/types';

import { AppContext } from '../contexts/app_context';
import { getPrecinctIdsInManualTally } from '../utils/manual_tallies';

import { NavigationScreen } from '../components/navigation_screen';
import { routerPaths } from '../router_paths';
import { ImportCvrFilesModal } from '../components/import_cvrfiles_modal';
import { ConfirmRemovingFileModal } from '../components/confirm_removing_file_modal';
import { TIME_FORMAT } from '../config/globals';
import { getCastVoteRecordFileMode, getCastVoteRecordFiles } from '../api';

export function TallyScreen(): JSX.Element | null {
  const {
    electionDefinition,
    isOfficialResults,
    fullElectionManualTally,
    resetFiles,
    auth,
  } = useContext(AppContext);
  assert(electionDefinition);
  assert(isElectionManagerAuth(auth));
  const { election } = electionDefinition;

  const [confirmingRemoveFileType, setConfirmingRemoveFileType] =
    useState<ResultsFileType>();
  const [isImportCvrModalOpen, setIsImportCvrModalOpen] = useState(false);

  function beginConfirmRemoveFiles(fileType: ResultsFileType) {
    setConfirmingRemoveFileType(fileType);
  }
  function cancelConfirmingRemoveFiles() {
    setConfirmingRemoveFileType(undefined);
  }
  async function confirmRemoveFiles(fileType: ResultsFileType) {
    setConfirmingRemoveFileType(undefined);
    await resetFiles(fileType);
  }

  function getPrecinctNames(precinctIds: readonly string[]) {
    return precinctIds
      .map((id) => find(election.precincts, (p) => p.id === id).name)
      .join(', ');
  }

  const castVoteRecordFileModeQuery = getCastVoteRecordFileMode.useQuery();
  const castVoteRecordFilesQuery = getCastVoteRecordFiles.useQuery();

  if (
    !castVoteRecordFilesQuery.isSuccess ||
    !castVoteRecordFileModeQuery.isSuccess
  ) {
    return (
      <NavigationScreen>
        <Prose maxWidth={false}>
          <h1>Cast Vote Record (CVR) Management</h1>
        </Prose>
      </NavigationScreen>
    );
  }

  const castVoteRecordFileList = castVoteRecordFilesQuery.data;
  const hasAnyFiles =
    castVoteRecordFileList.length > 0 || fullElectionManualTally;
  const hasManualData = !!fullElectionManualTally;

  const fileMode = castVoteRecordFileModeQuery.data;
  const fileModeText =
    fileMode === Admin.CvrFileMode.Test
      ? 'Currently tallying test ballots. Once you have completed L&A testing and are ready to start tallying official ballots remove all of the loaded CVR files before loading official ballot results.'
      : fileMode === Admin.CvrFileMode.Official
      ? 'Currently tallying official ballots.'
      : '';

  return (
    <React.Fragment>
      <NavigationScreen>
        <Prose maxWidth={false}>
          <h1>Cast Vote Record (CVR) Management</h1>
          <Text>{fileModeText}</Text>
          {isOfficialResults && (
            <Button
              variant="danger"
              disabled={!hasAnyFiles}
              onPress={() => beginConfirmRemoveFiles(ResultsFileType.All)}
            >
              Clear All Tallies and Results
            </Button>
          )}

          <p>
            <Button
              variant="primary"
              disabled={isOfficialResults}
              onPress={() => setIsImportCvrModalOpen(true)}
            >
              Load CVR Files
            </Button>{' '}
            <Button
              disabled={
                fileMode === Admin.CvrFileMode.Unlocked || isOfficialResults
              }
              onPress={() =>
                beginConfirmRemoveFiles(ResultsFileType.CastVoteRecord)
              }
            >
              Remove CVR Files
            </Button>
          </p>
          <Table data-testid="loaded-file-table">
            <tbody>
              {hasAnyFiles ? (
                <React.Fragment>
                  <tr>
                    <TD as="th" narrow nowrap>
                      Created At
                    </TD>
                    <TD as="th" nowrap>
                      CVR Count
                    </TD>
                    <TD as="th" narrow nowrap>
                      Source
                    </TD>
                    <TD as="th" nowrap>
                      Precinct
                    </TD>
                  </tr>
                  {castVoteRecordFileList.map(
                    ({
                      filename,
                      exportTimestamp,
                      numCvrsImported,
                      scannerIds,
                      precinctIds,
                    }) => (
                      <tr key={filename}>
                        <TD narrow nowrap>
                          {moment(exportTimestamp).format(
                            'MM/DD/YYYY hh:mm:ss A'
                          )}
                        </TD>
                        <TD nowrap>{format.count(numCvrsImported)} </TD>
                        <TD narrow nowrap>
                          {scannerIds.join(', ')}
                        </TD>
                        <TD>{getPrecinctNames(precinctIds)}</TD>
                      </tr>
                    )
                  )}
                  {fullElectionManualTally ? (
                    <tr key="manual-data">
                      <TD narrow nowrap>
                        {moment(
                          fullElectionManualTally.timestampCreated
                        ).format(TIME_FORMAT)}
                      </TD>
                      <TD narrow>
                        {format.count(
                          fullElectionManualTally.overallTally
                            .numberOfBallotsCounted
                        )}
                      </TD>
                      <TD narrow nowrap>
                        Manually Entered Results
                      </TD>
                      <TD>
                        {getPrecinctNames(
                          getPrecinctIdsInManualTally(fullElectionManualTally)
                        )}
                      </TD>
                    </tr>
                  ) : null}
                  <tr>
                    <TD as="th" narrow nowrap>
                      Total CVRs Count
                    </TD>
                    <TD as="th" narrow data-testid="total-cvr-count">
                      {format.count(
                        castVoteRecordFileList.reduce(
                          (prev, curr) => prev + curr.numCvrsImported,
                          0
                        ) +
                          (fullElectionManualTally?.overallTally
                            .numberOfBallotsCounted ?? 0)
                      )}
                    </TD>
                    <TD />
                    <TD as="th" />
                  </tr>
                </React.Fragment>
              ) : (
                <tr>
                  <TD colSpan={2}>
                    <em>No CVR files loaded.</em>
                  </TD>
                </tr>
              )}
            </tbody>
          </Table>
          <h2>Manually Entered Results</h2>
          <p>
            <LinkButton
              to={routerPaths.manualDataImport}
              disabled={isOfficialResults}
            >
              {hasManualData
                ? 'Edit Manually Entered Results'
                : 'Add Manually Entered Results'}
            </LinkButton>{' '}
            <Button
              disabled={!hasManualData || isOfficialResults}
              onPress={() => beginConfirmRemoveFiles(ResultsFileType.Manual)}
            >
              Remove Manual Data
            </Button>
          </p>
        </Prose>
      </NavigationScreen>
      {confirmingRemoveFileType && (
        <ConfirmRemovingFileModal
          fileType={confirmingRemoveFileType}
          onConfirm={confirmRemoveFiles}
          onCancel={cancelConfirmingRemoveFiles}
        />
      )}
      {isImportCvrModalOpen && (
        <ImportCvrFilesModal onClose={() => setIsImportCvrModalOpen(false)} />
      )}
    </React.Fragment>
  );
}
