import React, { useEffect } from 'react';

import {
  P,
  Button,
  ChangePrecinctButton,
  CurrentDateAndTime,
  ElectionInfoBar,
  H1,
  H2,
  Main,
  Prose,
  Screen,
  SegmentedButton,
  SetClockButton,
  TestMode,
  Text,
  UsbControllerButton,
  UsbDrive,
} from '@votingworks/ui';
import {
  ElectionDefinition,
  PollsState,
  PrecinctSelection,
} from '@votingworks/types';
import { makeAsync } from '@votingworks/utils';
import { Logger } from '@votingworks/logging';
// eslint-disable-next-line vx/gts-no-import-export-type
import type { MachineConfig } from '@votingworks/mark-backend';
import { ScreenReader } from '../config/types';

export interface AdminScreenProps {
  appPrecinct?: PrecinctSelection;
  ballotsPrintedCount: number;
  electionDefinition: ElectionDefinition;
  isLiveMode: boolean;
  updateAppPrecinct: (appPrecinct: PrecinctSelection) => void;
  toggleLiveMode: VoidFunction;
  unconfigure: () => Promise<void>;
  machineConfig: MachineConfig;
  screenReader: ScreenReader;
  pollsState: PollsState;
  logger: Logger;
  usbDrive: UsbDrive;
}

export function AdminScreen({
  appPrecinct,
  ballotsPrintedCount,
  electionDefinition,
  isLiveMode,
  updateAppPrecinct,
  toggleLiveMode,
  unconfigure,
  machineConfig,
  screenReader,
  pollsState,
  logger,
  usbDrive,
}: AdminScreenProps): JSX.Element {
  const { election } = electionDefinition;

  // Disable the audiotrack when in admin mode
  useEffect(() => {
    const initialMuted = screenReader.isMuted();
    screenReader.mute();
    return () => screenReader.toggleMuted(initialMuted);
  }, [screenReader]);

  return (
    <Screen>
      {election && !isLiveMode && <TestMode />}
      <Main padded>
        <Prose>
          <H1>
            VxMark{' '}
            <Text as="span" light noWrap>
              Election Manager Actions
            </Text>
          </H1>
          <Text italic>Remove card when finished.</Text>
          {election && (
            <React.Fragment>
              <H2>Stats</H2>
              <P>
                Ballots Printed: <strong>{ballotsPrintedCount}</strong>
              </P>
              <H2>
                <label htmlFor="selectPrecinct">Precinct</label>
              </H2>
              <P>
                <ChangePrecinctButton
                  appPrecinctSelection={appPrecinct}
                  updatePrecinctSelection={makeAsync(updateAppPrecinct)}
                  election={election}
                  mode={
                    pollsState === 'polls_closed_final' ||
                    election.precincts.length === 1
                      ? 'disabled'
                      : 'default'
                  }
                  logger={logger}
                />
                <br />
                <Text small italic as="span">
                  Changing the precinct will reset the Ballots Printed count.
                </Text>
                {election.precincts.length === 1 && (
                  <React.Fragment>
                    <br />
                    <Text small italic as="span">
                      Precinct cannot be changed because there is only one
                      precinct configured for this election.
                    </Text>
                  </React.Fragment>
                )}
              </P>
              <H2>Test Ballot Mode</H2>
              <P>
                <SegmentedButton
                  label="Test Ballot Mode"
                  hideLabel
                  onChange={toggleLiveMode}
                  options={[
                    { id: 'test', label: 'Test Ballot Mode' },
                    { id: 'official', label: 'Official Ballot Mode' },
                  ]}
                  selectedOptionId={isLiveMode ? 'official' : 'test'}
                />
                <br />
                <Text small italic as="span">
                  Switching the mode will reset the Ballots Printed count.
                </Text>
              </P>
            </React.Fragment>
          )}
          <H2>Current Date and Time</H2>
          <P>
            <CurrentDateAndTime />
          </P>
          <P>
            <SetClockButton>Update Date and Time</SetClockButton>
          </P>
          <H2>Configuration</H2>
          <P>
            <Text as="span" voteIcon>
              Election Definition is loaded.
            </Text>{' '}
            <Button variant="danger" small onPress={unconfigure}>
              Unconfigure Machine
            </Button>
          </P>
          <H2>USB</H2>
          <UsbControllerButton
            small={false}
            primary
            usbDriveStatus={usbDrive.status}
            usbDriveEject={() => usbDrive.eject('election_manager')}
          />
        </Prose>
      </Main>
      {election && (
        <ElectionInfoBar
          mode="admin"
          electionDefinition={electionDefinition}
          codeVersion={machineConfig.codeVersion}
          machineId={machineConfig.machineId}
          precinctSelection={appPrecinct}
        />
      )}
    </Screen>
  );
}
