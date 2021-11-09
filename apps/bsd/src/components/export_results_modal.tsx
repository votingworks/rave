import { ElectionDefinition } from '@votingworks/types';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import fileDownload from 'js-file-download';
import path from 'path';

import {
  generateElectionBasedSubfolderName,
  generateFilenameForScanningResults,
  SCANNER_RESULTS_FOLDER,
  usbstick,
} from '@votingworks/utils';
import { UsbControllerButton } from '@votingworks/ui';
import { strict as assert } from 'assert';
import { AppContext } from '../contexts/app_context';
import { Modal } from './modal';
import { Button } from './button';
import { Prose } from './prose';
import { LinkButton } from './link_button';
import { Loading } from './loading';

function throwBadStatus(s: never): never {
  throw new Error(`Bad status: ${s}`);
}

const UsbImage = styled.img`
  margin-right: auto;
  margin-left: auto;
  height: 200px;
`;

export interface Props {
  onClose: () => void;
  electionDefinition: ElectionDefinition;
  numberOfBallots: number;
  isTestMode: boolean;
}

enum ModalState {
  ERROR = 'error',
  SAVING = 'saving',
  DONE = 'done',
  INIT = 'init',
}

export function ExportResultsModal({
  onClose,
  electionDefinition,
  numberOfBallots,
  isTestMode,
}: Props): JSX.Element {
  const [currentState, setCurrentState] = useState<ModalState>(ModalState.INIT);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    machineConfig,
    usbDriveEject,
    usbDriveStatus,
    currentUserSession,
  } = useContext(AppContext);
  assert(currentUserSession); // TODO(auth) should this check that the current user is an admin

  async function exportResults(openDialog: boolean) {
    setCurrentState(ModalState.SAVING);

    try {
      const response = await fetch(`/scan/export`, {
        method: 'post',
      });

      const blob = await response.blob();

      if (response.status !== 200) {
        setErrorMessage(
          `Failed to save results. Error retrieving CVRs from the scanner.`
        );
        setCurrentState(ModalState.ERROR);
        return;
      }

      const cvrFilename = generateFilenameForScanningResults(
        machineConfig.machineId,
        numberOfBallots,
        isTestMode,
        new Date()
      );

      if (window.kiosk) {
        const usbPath = await usbstick.getDevicePath();
        if (!usbPath) {
          throw new Error(
            'could not begin download; path to usb drive missing'
          );
        }
        const electionFolderName = generateElectionBasedSubfolderName(
          electionDefinition.election,
          electionDefinition.electionHash
        );
        const pathToFolder = path.join(
          usbPath,
          SCANNER_RESULTS_FOLDER,
          electionFolderName
        );
        const pathToFile = path.join(pathToFolder, cvrFilename);
        if (openDialog) {
          const fileWriter = await window.kiosk.saveAs({
            defaultPath: pathToFile,
          });

          if (!fileWriter) {
            throw new Error('could not begin download; no file was chosen');
          }

          await fileWriter.write(await blob.text());
          await fileWriter.end();
        } else {
          await window.kiosk.makeDirectory(pathToFolder, {
            recursive: true,
          });
          await window.kiosk.writeFile(pathToFile, await blob.text());
        }
        setCurrentState(ModalState.DONE);
      } else {
        fileDownload(blob, cvrFilename, 'application/x-jsonlines');
        setCurrentState(ModalState.DONE);
      }
    } catch (error) {
      setErrorMessage(`Failed to save results. ${error.message}`);
      setCurrentState(ModalState.ERROR);
    }
  }

  if (currentState === ModalState.ERROR) {
    return (
      <Modal
        content={
          <Prose>
            <h1>Download Failed</h1>
            <p>{errorMessage}</p>
          </Prose>
        }
        onOverlayClick={onClose}
        actions={<LinkButton onPress={onClose}>Close</LinkButton>}
      />
    );
  }

  if (currentState === ModalState.DONE) {
    if (usbDriveStatus === usbstick.UsbDriveStatus.recentlyEjected) {
      return (
        <Modal
          content={
            <Prose>
              <h1>Download Complete</h1>
              <p>
                USB drive successfully ejected, you may now take it to Election
                Manager for tabulation.
              </p>
            </Prose>
          }
          onOverlayClick={onClose}
          actions={<Button onPress={onClose}>Close</Button>}
        />
      );
    }
    return (
      <Modal
        content={
          <Prose>
            <h1>Download Complete</h1>
            <p>
              CVR results file saved successfully! You may now eject the USB
              drive and take it to Election Manager for tabulation.
            </p>
          </Prose>
        }
        onOverlayClick={onClose}
        actions={
          <React.Fragment>
            <LinkButton onPress={onClose}>Cancel</LinkButton>
            <UsbControllerButton
              small={false}
              primary
              usbDriveStatus={usbDriveStatus}
              usbDriveEject={() => usbDriveEject(currentUserSession.type)}
            />
          </React.Fragment>
        }
      />
    );
  }

  if (currentState === ModalState.SAVING) {
    return <Modal content={<Loading />} onOverlayClick={onClose} />;
  }

  if (currentState !== ModalState.INIT) {
    throwBadStatus(currentState); // Creates a compile time check that all states are being handled.
  }

  switch (usbDriveStatus) {
    case usbstick.UsbDriveStatus.absent:
    case usbstick.UsbDriveStatus.notavailable:
    case usbstick.UsbDriveStatus.recentlyEjected:
      // When run not through kiosk mode let the user download the file
      // on the machine for internal debugging use
      return (
        <Modal
          content={
            <Prose>
              <h1>No USB Drive Detected</h1>
              <p>
                <UsbImage
                  src="usb-stick.svg"
                  alt="Insert USB Image"
                  onDoubleClick={() => exportResults(true)}
                />
                Please insert a USB drive in order to export the scanner
                results.
              </p>
            </Prose>
          }
          onOverlayClick={onClose}
          actions={
            <React.Fragment>
              <LinkButton onPress={onClose}>Cancel</LinkButton>
              {!window.kiosk && (
                <Button
                  data-testid="manual-export"
                  onPress={() => exportResults(true)}
                >
                  Export
                </Button>
              )}{' '}
            </React.Fragment>
          }
        />
      );
    case usbstick.UsbDriveStatus.ejecting:
    case usbstick.UsbDriveStatus.present:
      return (
        <Modal
          content={<Loading />}
          onOverlayClick={onClose}
          actions={
            <React.Fragment>
              <LinkButton onPress={onClose}>Cancel</LinkButton>
            </React.Fragment>
          }
        />
      );
    case usbstick.UsbDriveStatus.mounted:
      return (
        <Modal
          content={
            <Prose>
              <h1>Export Results</h1>
              <UsbImage
                src="usb-stick.svg"
                alt="Insert USB Image"
                onDoubleClick={() => exportResults(true)}
              />
              <p>
                A CVR file will automatically be saved to the default location
                on the mounted USB drive. Optionally, you may pick a custom
                export location.
              </p>
            </Prose>
          }
          onOverlayClick={onClose}
          actions={
            <React.Fragment>
              <LinkButton onPress={onClose}>Cancel</LinkButton>
              <Button onPress={() => exportResults(true)}>Custom</Button>
              <Button primary onPress={() => exportResults(false)}>
                Export
              </Button>
            </React.Fragment>
          }
        />
      );
    default:
      // Creates a compile time check to make sure this switch statement includes all enum values for UsbDriveStatus
      throwBadStatus(usbDriveStatus);
  }
}
