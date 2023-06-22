import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  filterTalliesByParamsAndBatchId,
  isElectionManagerAuth,
} from '@votingworks/utils';
import { assert, find } from '@votingworks/basics';
import { LogEventId } from '@votingworks/logging';
import {
  VotingMethod,
  getLabelForVotingMethod,
  getPrecinctById,
} from '@votingworks/types';
import {
  Button,
  Caption,
  Font,
  H2,
  Icons,
  LinkButton,
  Modal,
  P,
  printElement,
  printElementToPdf,
  TallyReportMetadata,
  TallyReportPreview,
} from '@votingworks/ui';
import { UseQueryResult } from '@tanstack/react-query';
import type { WriteInAdjudicatedTally } from '@votingworks/admin-backend';
import { generateDefaultReportFilename } from '../utils/save_as_pdf';

import {
  PrecinctReportScreenProps,
  ScannerReportScreenProps,
  PartyReportScreenProps,
  BatchReportScreenProps,
  VotingMethodReportScreenProps,
} from '../config/types';
import { AppContext } from '../contexts/app_context';

import { NavigationScreen } from '../components/navigation_screen';

import { routerPaths } from '../router_paths';

import {
  SaveFrontendFileModal,
  FileType,
} from '../components/save_frontend_file_modal';
import { ElectionManagerTallyReport } from '../components/election_manager_tally_report';
import {
  getInvalidWriteInCounts,
  getOfficialCandidateScreenAdjudicatedWriteInCounts,
} from '../utils/write_ins';
import { PrintButton } from '../components/print_button';
import {
  getCastVoteRecordFileMode,
  getWriteInTallies,
  markResultsOfficial,
} from '../api';

export function TallyReportScreen(): JSX.Element {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isMarkOfficialModalOpen, setIsMarkOfficialModalOpen] = useState(false);
  const { precinctId } = useParams<PrecinctReportScreenProps>();
  const { scannerId } = useParams<ScannerReportScreenProps>();
  const { batchId } = useParams<BatchReportScreenProps>();
  const { partyId } = useParams<PartyReportScreenProps>();
  const { votingMethod: votingMethodFromProps } =
    useParams<VotingMethodReportScreenProps>();
  const votingMethod = votingMethodFromProps as VotingMethod;
  const {
    electionDefinition,
    isOfficialResults,
    fullElectionTally,
    fullElectionManualTally,
    isTabulationRunning,
    auth,
    logger,
  } = useContext(AppContext);
  const markResultsOfficialMutation = markResultsOfficial.useMutation();
  assert(electionDefinition);
  assert(isElectionManagerAuth(auth)); // TODO(auth) check permissions for viewing tally reports.
  const userRole = auth.user.role;
  const writeInTalliesQuery = getWriteInTallies.useQuery({
    status: 'adjudicated',
  }) as UseQueryResult<WriteInAdjudicatedTally[]>;

  const screenAdjudicatedOfficialCandidateWriteInCounts =
    getOfficialCandidateScreenAdjudicatedWriteInCounts(
      writeInTalliesQuery.data ?? []
    );
  const invalidWriteInCounts = getInvalidWriteInCounts(
    writeInTalliesQuery.data ?? []
  );

  const castVoteRecordFileModeQuery = getCastVoteRecordFileMode.useQuery();

  const location = useLocation();

  const { election } = electionDefinition;
  const statusPrefix = isOfficialResults ? 'Official' : 'Unofficial';

  const precinctName = getPrecinctById({ election, precinctId })?.name;

  const fileSuffix = useMemo(() => {
    if (scannerId) {
      return `scanner-${scannerId}`;
    }
    if (batchId) {
      return `batch-${batchId}`;
    }
    if (precinctId === 'all') {
      return 'all-precincts';
    }
    if (partyId) {
      const party = find(election.parties, (p) => p.id === partyId);
      return party.fullName;
    }
    if (votingMethod) {
      const label = getLabelForVotingMethod(votingMethod);
      return `${label}-ballots`;
    }
    return precinctName;
  }, [
    batchId,
    scannerId,
    precinctId,
    votingMethod,
    partyId,
    election.parties,
    precinctName,
  ]);
  const batchLabel = useMemo(() => {
    if (batchId) {
      assert(fullElectionTally);
      const batchTally = filterTalliesByParamsAndBatchId(
        fullElectionTally,
        election,
        batchId,
        {}
      );
      return `${batchTally.batchLabel} (Scanner: ${batchTally.scannerIds.join(
        ', '
      )})`;
    }
    return '';
  }, [batchId, fullElectionTally, election]);
  const reportDisplayTitle = useMemo(() => {
    if (precinctName) {
      return `${statusPrefix} Precinct Tally Report for ${precinctName}`;
    }
    if (scannerId) {
      return `${statusPrefix} Scanner Tally Report for Scanner ${scannerId}`;
    }
    if (batchId) {
      return `${statusPrefix} Batch Tally Report for ${batchLabel}`;
    }
    if (precinctId === 'all') {
      return `${statusPrefix} ${election.title} Tally Reports for All Precincts`;
    }
    if (partyId) {
      const party = find(election.parties, (p) => p.id === partyId);
      return `${statusPrefix} Tally Report for ${party.fullName}`;
    }
    if (votingMethod) {
      const label = getLabelForVotingMethod(votingMethod);
      return `${statusPrefix} ${label} Ballot Tally Report`;
    }
    return `${statusPrefix} ${election.title} Tally Report`;
  }, [
    batchId,
    scannerId,
    precinctId,
    votingMethod,
    partyId,
    batchLabel,
    statusPrefix,
    election,
    precinctName,
  ]);

  const generatedAtTime = new Date();
  const tallyReport = (
    <ElectionManagerTallyReport
      batchId={batchId}
      batchLabel={batchLabel}
      election={election}
      fullElectionManualTally={fullElectionManualTally}
      fullElectionTally={fullElectionTally}
      officialCandidateWriteIns={
        screenAdjudicatedOfficialCandidateWriteInCounts
      }
      invalidWriteIns={invalidWriteInCounts}
      generatedAtTime={generatedAtTime}
      tallyReportType={isOfficialResults ? 'Official' : 'Unofficial'}
      partyId={partyId}
      precinctId={precinctId}
      scannerId={scannerId}
      votingMethod={votingMethod}
    />
  );

  useEffect(() => {
    void logger.log(LogEventId.TallyReportPreviewed, userRole, {
      message: `User previewed the ${reportDisplayTitle}.`,
      disposition: 'success',
      tallyReportTitle: reportDisplayTitle,
    });
  }, [logger, reportDisplayTitle, userRole]);

  async function printTallyReport() {
    try {
      await printElement(tallyReport, { sides: 'one-sided' });
      await logger.log(LogEventId.TallyReportPrinted, userRole, {
        message: `User printed ${reportDisplayTitle}`,
        disposition: 'success',
        tallyReportTitle: reportDisplayTitle,
      });
    } catch (error) {
      assert(error instanceof Error);
      await logger.log(LogEventId.TallyReportPrinted, userRole, {
        message: `Error in attempting to print ${reportDisplayTitle}: ${error.message}`,
        disposition: 'failure',
        tallyReportTitle: reportDisplayTitle,
        result: 'User shown error.',
      });
    }
  }

  function closeMarkOfficialModal() {
    setIsMarkOfficialModalOpen(false);
  }
  function openMarkOfficialModal() {
    setIsMarkOfficialModalOpen(true);
  }
  function markOfficial() {
    setIsMarkOfficialModalOpen(false);
    markResultsOfficialMutation.mutate();
  }

  if (isTabulationRunning) {
    return (
      <NavigationScreen centerChild title="Building Tabulation Report...">
        <P>This may take a few seconds.</P>
      </NavigationScreen>
    );
  }

  const defaultReportFilename = generateDefaultReportFilename(
    'tabulation-report',
    election,
    fileSuffix
  );

  return (
    <React.Fragment>
      <NavigationScreen title={reportDisplayTitle}>
        <TallyReportMetadata
          generatedAtTime={generatedAtTime}
          election={election}
        />
        <P>
          <PrintButton variant="primary" print={printTallyReport}>
            Print Report
          </PrintButton>{' '}
          {window.kiosk && (
            <Button onPress={() => setIsSaveModalOpen(true)}>
              Save Report as PDF
            </Button>
          )}
        </P>
        {location.pathname === routerPaths.tallyFullReport && (
          <P>
            <Button
              disabled={
                !castVoteRecordFileModeQuery.isSuccess ||
                castVoteRecordFileModeQuery.data === 'unlocked' ||
                isOfficialResults
              }
              onPress={openMarkOfficialModal}
            >
              Mark Tally Results as Official
            </Button>
          </P>
        )}
        <P>
          <LinkButton small to={routerPaths.reports}>
            Back to Reports
          </LinkButton>
        </P>
        <H2>Report Preview</H2>
        <Caption>
          <Icons.Info /> <Font weight="bold">Note:</Font> Printed reports may be
          paginated to more than one piece of paper.
        </Caption>
        <TallyReportPreview data-testid="report-preview">
          {tallyReport}
        </TallyReportPreview>
      </NavigationScreen>
      {isSaveModalOpen && (
        <SaveFrontendFileModal
          onClose={() => setIsSaveModalOpen(false)}
          generateFileContent={() => printElementToPdf(tallyReport)}
          defaultFilename={defaultReportFilename}
          fileType={FileType.TallyReport}
        />
      )}
      {isMarkOfficialModalOpen && (
        <Modal
          title="Mark Unofficial Tally Results as Official Tally Results?"
          content={
            <React.Fragment>
              <P>
                Have all CVR files been loaded? Once results are marked as
                official, no additional CVR files can be loaded.
              </P>
              <P>Have all unofficial tally reports been reviewed?</P>
            </React.Fragment>
          }
          actions={
            <React.Fragment>
              <Button variant="primary" onPress={markOfficial}>
                Mark Tally Results as Official
              </Button>
              <Button onPress={closeMarkOfficialModal}>Cancel</Button>
            </React.Fragment>
          }
          onOverlayClick={closeMarkOfficialModal}
        />
      )}
    </React.Fragment>
  );
}
