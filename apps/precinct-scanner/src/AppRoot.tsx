import { ScannerStatus } from '@votingworks/types/api/module-scan'
import React, { useCallback, useEffect, useReducer } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import useInterval from '@rooks/use-interval'
import 'normalize.css'
import { map } from 'rxjs/operators'
import makeDebug from 'debug'

import {
  AdjudicationReason,
  AdminCardData,
  CardData,
  ElectionDefinition,
  OptionalElectionDefinition,
} from '@votingworks/types'
import UnconfiguredElectionScreen from './screens/UnconfiguredElectionScreen'
import LoadingConfigurationScreen from './screens/LoadingConfigurationScreen'
import { Hardware, isCardReader } from './utils/Hardware'
import {
  CardPresentAPI,
  BallotState,
  ScanningResultType,
  ISO8601Timestamp,
  RejectedScanningReason,
} from './config/types'
import {
  CARD_POLLING_INTERVAL,
  POLLING_INTERVAL_FOR_SCANNER_STATUS_MS,
  POLLING_INTERVAL_FOR_USB,
  TIME_TO_DISMISS_ERROR_SUCCESS_SCREENS_MS,
  STATUS_POLLING_EXTRA_CHECKS,
} from './config/globals'
import {
  getStatus as usbDriveGetStatus,
  doMount,
  UsbDriveStatus,
} from './utils/usbstick'

import * as config from './api/config'
import * as scan from './api/scan'
import throwIllegalValue from './utils/throwIllegalValue'

import { Card } from './utils/Card'

import AdminScreen from './screens/AdminScreen'
import SetupCardReaderPage from './screens/SetupCardReaderPage'
import InvalidCardScreen from './screens/InvalidCardScreen'
// import PollsClosedScreen from './screens/PollsClosedScreen'
// import PollWorkerScreen from './screens/PollWorkerScreen'
// <PollWorkerScreen
//   appPrecinctId="42"
//   ballotsScannedCount={42}
//   electionDefinition={electionDefinition}
//   isPollsOpen={false}
//   openPolls={() => {}}
//   closePolls={() => {}}
// />

import InsertBallotScreen from './screens/InsertBallotScreen'
// import PollsClosedScreen from './screens/PollsClosedScreen'
import ScanErrorScreen from './screens/ScanErrorScreen'
import ScanSuccessScreen from './screens/ScanSuccessScreen'
import ScanWarningScreen from './screens/ScanWarningScreen'
import ScanProcessingScreen from './screens/ScanProcessingScreen'
import LoadingScreen from './screens/LoadingScreen'

const debug = makeDebug('precinct-scanner:app-root')

export interface AppStorage {
  electionDefinition?: ElectionDefinition
  configuredAt?: ISO8601Timestamp
}

export interface Props extends RouteComponentProps {
  hardware: Hardware
  card: Card
}

interface HardwareState {
  hasCardReaderAttached: boolean
  hasPrinterAttached: boolean
  usbDriveStatus: UsbDriveStatus
  adminCardElectionHash: string
  isAdminCardPresent: boolean
  invalidCardPresent: boolean
  lastCardDataString: string
  // machineConfig: Readonly<MachineConfig>
}

interface ScanInformationState {
  adjudicationReasons: AdjudicationReason[]
  rejectionReason?: RejectedScanningReason
}

interface SharedState {
  electionDefinition: OptionalElectionDefinition
  isScannerConfigured: boolean
  isTestMode: boolean
  scannedBallotCount: number
  ballotState: BallotState
  timeoutToInsertScreen?: number
  isStatusPollingEnabled: boolean
  currentPrecinctId: string // TODO(caro) make this actually do anything
  isLoading: boolean
}

export interface State
  extends HardwareState,
    SharedState,
    ScanInformationState {}

const initialHardwareState: Readonly<HardwareState> = {
  hasCardReaderAttached: true,
  hasPrinterAttached: true,
  usbDriveStatus: UsbDriveStatus.absent,
  adminCardElectionHash: '',
  isAdminCardPresent: false,
  invalidCardPresent: false,
  lastCardDataString: '',
  // machineConfig: { machineId: '0000', codeVersion: 'dev' },
}

const initialSharedState: Readonly<SharedState> = {
  electionDefinition: undefined,
  isScannerConfigured: false,
  isTestMode: false,
  scannedBallotCount: 0,
  ballotState: BallotState.IDLE,
  isStatusPollingEnabled: true,
  currentPrecinctId: '',
  isLoading: false,
}

const initialScanInformationState: Readonly<ScanInformationState> = {
  adjudicationReasons: [],
  rejectionReason: undefined,
}

const initialAppState: Readonly<State> = {
  ...initialHardwareState,
  ...initialSharedState,
  ...initialScanInformationState,
}

// Sets State.
type AppAction =
  | { type: 'unconfigureScanner' }
  | {
      type: 'updateElectionDefinition'
      electionDefinition: OptionalElectionDefinition
    }
  | { type: 'updateUsbDriveStatus'; usbDriveStatus: UsbDriveStatus }
  | {
      type: 'refreshConfigFromScanner'
      electionDefinition: OptionalElectionDefinition
      isTestMode: boolean
    }
  | {
      type: 'ballotScanning'
      ballotCount?: number
    }
  | {
      type: 'ballotCast'
      timeoutToInsertScreen: number
    }
  | {
      type: 'ballotNeedsReview'
      adjudicationReasons: AdjudicationReason[]
    }
  | {
      type: 'ballotRejected'
      rejectionReason?: RejectedScanningReason
    }
  | {
      type: 'scannerError'
      timeoutToInsertScreen: number
      ballotCount?: number
    }
  | {
      type: 'readyToInsertBallot'
      ballotCount?: number
    }
  | {
      type: 'updateBallotCount'
      ballotCount: number
    }
  | { type: 'disableStatusPolling' }
  | { type: 'enableStatusPolling' }
  | { type: 'updateHardwareState'; hasCardReaderAttached: boolean }
  | {
      type: 'invalidCard'
    }
  | {
      type: 'processAdminCard'
      electionHash: string
    }
  | { type: 'updateLastCardDataString'; currentCardDataString: string }
  | { type: 'cardRemoved' }
  | { type: 'updatePrecinctId'; precinctId: string }
  | { type: 'startLoading' }
  | { type: 'endLoading' }

const appReducer = (state: State, action: AppAction): State => {
  debug(
    '%cReducer "%s"',
    'color: green',
    action.type,
    { ...action, electionDefinition: undefined },
    {
      ...state,
      electionDefinition: undefined,
    }
  )
  switch (action.type) {
    case 'updateUsbDriveStatus':
      return {
        ...state,
        usbDriveStatus: action.usbDriveStatus,
      }
    case 'updateElectionDefinition':
      return {
        ...state,
        electionDefinition: action.electionDefinition,
      }
    case 'refreshConfigFromScanner':
      return {
        ...state,
        electionDefinition: action.electionDefinition,
        isTestMode: action.isTestMode,
        isScannerConfigured: true,
      }
    case 'unconfigureScanner':
      return {
        ...state,
        isScannerConfigured: false,
      }
    case 'ballotScanning':
      return {
        ...state,
        ...initialScanInformationState,
        ballotState: BallotState.SCANNING,
        timeoutToInsertScreen: undefined,
        scannedBallotCount:
          action.ballotCount === undefined
            ? state.scannedBallotCount
            : action.ballotCount,
      }
    case 'ballotCast':
      return {
        ...state,
        ...initialScanInformationState,
        ballotState: BallotState.CAST,
        timeoutToInsertScreen: action.timeoutToInsertScreen,
      }
    case 'scannerError':
      return {
        ...state,
        ...initialScanInformationState,
        ballotState: BallotState.SCANNER_ERROR,
        timeoutToInsertScreen: action.timeoutToInsertScreen,
        scannedBallotCount:
          action.ballotCount === undefined
            ? state.scannedBallotCount
            : action.ballotCount,
      }
    case 'ballotRejected':
      return {
        ...state,
        ...initialScanInformationState,
        rejectionReason: action.rejectionReason,
        ballotState: BallotState.REJECTED,
      }
    case 'ballotNeedsReview':
      return {
        ...state,
        ...initialScanInformationState,
        adjudicationReasons: action.adjudicationReasons,
        ballotState: BallotState.NEEDS_REVIEW,
      }
    case 'readyToInsertBallot':
      return {
        ...state,
        ...initialScanInformationState,
        ballotState: BallotState.IDLE,
        scannedBallotCount:
          action.ballotCount === undefined
            ? state.scannedBallotCount
            : action.ballotCount,
        timeoutToInsertScreen: undefined,
      }
    case 'updateBallotCount':
      return {
        ...state,
        scannedBallotCount: action.ballotCount,
      }
    case 'disableStatusPolling':
      return {
        ...state,
        isStatusPollingEnabled: false,
      }
    case 'enableStatusPolling':
      return {
        ...state,
        isStatusPollingEnabled: true,
      }
    case 'updateHardwareState':
      return {
        ...state,
        hasCardReaderAttached: action.hasCardReaderAttached,
      }
    case 'invalidCard':
      return {
        ...state,
        invalidCardPresent: true,
      }
    case 'processAdminCard':
      return {
        ...state,
        isAdminCardPresent: true,
        adminCardElectionHash: action.electionHash,
      }
    case 'updateLastCardDataString': {
      return {
        ...state,
        lastCardDataString: action.currentCardDataString,
      }
    }
    case 'cardRemoved':
      return {
        ...state,
        isAdminCardPresent: false,
        invalidCardPresent: false,
      }
    case 'updatePrecinctId':
      return {
        ...state,
        currentPrecinctId: action.precinctId,
      }
    case 'startLoading':
      return {
        ...state,
        isStatusPollingEnabled: false,
        isLoading: true,
      }
    case 'endLoading':
      return {
        ...state,
        isStatusPollingEnabled: true,
        isLoading: false,
      }
  }
}

const sleep = (ms = 1000): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const AppRoot: React.FC<Props> = ({ hardware, card }) => {
  const [appState, dispatchAppState] = useReducer(appReducer, initialAppState)
  const {
    usbDriveStatus,
    electionDefinition,
    isScannerConfigured,
    ballotState,
    scannedBallotCount,
    timeoutToInsertScreen,
    isStatusPollingEnabled,
    adjudicationReasons,
    rejectionReason,
    isTestMode,
    hasCardReaderAttached,
    isAdminCardPresent,
    lastCardDataString,
    invalidCardPresent,
    currentPrecinctId,
    isLoading,
  } = appState

  const hasCardInserted = isAdminCardPresent || invalidCardPresent

  const refreshConfig = useCallback(async () => {
    const electionDefinition = await config.getElectionDefinition()
    const isTestMode = await config.getTestMode()
    dispatchAppState({
      type: 'refreshConfigFromScanner',
      electionDefinition,
      isTestMode,
    })
  }, [dispatchAppState])

  const dismissCurrentBallotMessage = useCallback((): number => {
    return window.setTimeout(
      () => dispatchAppState({ type: 'readyToInsertBallot' }),
      TIME_TO_DISMISS_ERROR_SUCCESS_SCREENS_MS
    )
  }, [dispatchAppState])

  const scanDetectedBallot = useCallback(async () => {
    dispatchAppState({ type: 'disableStatusPolling' })
    try {
      const scanningResult = await scan.scanDetectedSheet()
      switch (scanningResult.resultType) {
        case ScanningResultType.Rejected: {
          dispatchAppState({
            type: 'ballotRejected',
            rejectionReason: scanningResult.rejectionReason,
          })
          break
        }
        case ScanningResultType.NeedsReview:
          dispatchAppState({
            type: 'ballotNeedsReview',
            adjudicationReasons: scanningResult.adjudicationReasons,
          })
          break
        case ScanningResultType.Accepted: {
          dispatchAppState({
            type: 'ballotCast',
            timeoutToInsertScreen: dismissCurrentBallotMessage(),
          })
          break
        }
        /* istanbul ignore next */
        default:
          throwIllegalValue(scanningResult)
      }
    } catch (error) {
      /* istanbul ignore next */
      dispatchAppState({
        type: 'ballotRejected',
      })
    } finally {
      dispatchAppState({
        type: 'enableStatusPolling',
      })
    }
  }, [dispatchAppState, dismissCurrentBallotMessage])

  const acceptBallot = useCallback(async () => {
    try {
      dispatchAppState({
        type: 'disableStatusPolling',
      })
      dispatchAppState({
        type: 'ballotScanning',
      })
      const success = await scan.acceptBallotAfterReview()
      if (success) {
        dispatchAppState({
          type: 'ballotCast',
          timeoutToInsertScreen: dismissCurrentBallotMessage(),
        })
      } else {
        dispatchAppState({
          type: 'ballotRejected',
        })
      }
    } finally {
      dispatchAppState({
        type: 'enableStatusPolling',
      })
    }
  }, [dispatchAppState, dismissCurrentBallotMessage])

  const endBatch = useCallback(async () => {
    dispatchAppState({ type: 'disableStatusPolling' })
    try {
      await scan.endBatch()
    } finally {
      dispatchAppState({
        type: 'enableStatusPolling',
      })
    }
  }, [dispatchAppState])

  const usbStatusInterval = useInterval(
    async () => {
      const status = await usbDriveGetStatus()
      if (status !== usbDriveStatus) {
        dispatchAppState({
          type: 'updateUsbDriveStatus',
          usbDriveStatus: status,
        })
      }
      /* istanbul ignore next */
      if (status === UsbDriveStatus.present) {
        await doMount()
      }
    },
    /* istanbul ignore next */
    usbDriveStatus === UsbDriveStatus.notavailable
      ? null
      : POLLING_INTERVAL_FOR_USB,
    true
  )

  const [startBallotStatusPolling, endBallotStatusPolling] = useInterval(
    async () => {
      if (!isStatusPollingEnabled) {
        return
      }
      dispatchAppState({ type: 'disableStatusPolling' })

      const { scannerState, ballotCount } = await scan.getCurrentStatus()

      // The scanner can occasionally be very briefly in an unexpected state, we should make sure that the scanner stays in the current
      // state for 200ms before making any changes.
      for (let i = 0; i < STATUS_POLLING_EXTRA_CHECKS; i++) {
        await sleep(100)
        const {
          scannerState: scannerStateAgain,
        } = await scan.getCurrentStatus()
        // If the state has already changed, abort and start the polling again.
        if (scannerStateAgain !== scannerState) {
          debug('saw a momentary blip in scanner status, aborting', {
            firstStatus: scannerState,
            nextStatus: scannerStateAgain,
          })
          dispatchAppState({ type: 'enableStatusPolling' })
          return
        }
      }
      dispatchAppState({ type: 'enableStatusPolling' })

      const isCapableOfBeginingNewScan =
        ballotState === BallotState.IDLE ||
        ballotState === BallotState.CAST ||
        ballotState === BallotState.SCANNER_ERROR

      const isHoldingPaperForVoterRemoval =
        ballotState === BallotState.REJECTED ||
        ballotState === BallotState.NEEDS_REVIEW

      debug({
        scannerState,
        ballotCount,
        ballotState,
        isCapableOfBeginingNewScan,
        isHoldingPaperForVoterRemoval,
      })

      // Figure out what ballot state we are in, defaulting to the current state.
      switch (scannerState) {
        case ScannerStatus.Error:
        case ScannerStatus.Unknown: {
          // The scanner returned an error move to the error screen. Assume there is not currently paper in the scanner.
          // TODO(531) Bugs in module-scan make this happen at confusing moments, ignore for now.
          debug('got a bad scanner status', scannerState)
          /* dispatchAppState({
            type: 'scannerError',
            timeoutToInsertScreen: dismissCurrentBallotMessage(),
            ballotCount,
          }) */
          return
        }
        case ScannerStatus.ReadyToScan:
          if (isCapableOfBeginingNewScan) {
            // If we are going to reset the machine back to the insert ballot screen, cancel that.
            if (timeoutToInsertScreen) {
              window.clearTimeout(timeoutToInsertScreen)
            }
            // begin scanning
            dispatchAppState({
              type: 'ballotScanning',
              ballotCount,
            })
            await scanDetectedBallot()
          }
          return
        case ScannerStatus.WaitingForPaper:
          // When we can not begin a new scan we are not expecting to be waiting for paper
          // This will happen if someone is ripping the paper out of the scanner while scanning, or reviewing
          // a ballot.
          if (isHoldingPaperForVoterRemoval) {
            // The voter has removed the ballot, end the batch and reset to the insert screen.
            await endBatch()
            /* istanbul ignore next */
            if (timeoutToInsertScreen) {
              window.clearTimeout(timeoutToInsertScreen)
            }
            dispatchAppState({ type: 'readyToInsertBallot', ballotCount })
            return
          }
      }
      if (ballotCount !== scannedBallotCount) {
        dispatchAppState({ type: 'updateBallotCount', ballotCount })
      }
    },
    POLLING_INTERVAL_FOR_SCANNER_STATUS_MS
  )
  const startUsbStatusPolling = useCallback(usbStatusInterval[0], [])
  const stopUsbStatusPolling = useCallback(usbStatusInterval[0], [])

  useEffect(() => {
    const initialize = async () => {
      try {
        await refreshConfig()
      } catch (e) {
        debug('failed to initialize:', e)
        dispatchAppState({
          type: 'unconfigureScanner',
        })
        endBallotStatusPolling()
        window.setTimeout(initialize, 1000)
      }
    }

    initialize()
  }, [refreshConfig])

  useEffect(() => {
    // TODO(caro): also check for polls open and no card insertted
    if (isScannerConfigured && electionDefinition && !hasCardInserted) {
      startBallotStatusPolling()
    } else {
      endBallotStatusPolling()
    }
  }, [isScannerConfigured, electionDefinition, hasCardInserted])

  const setElectionDefinition = async (
    electionDefinition: OptionalElectionDefinition
  ) => {
    dispatchAppState({ type: 'updateElectionDefinition', electionDefinition })
    await refreshConfig()
  }

  const toggleTestMode = async () => {
    dispatchAppState({ type: 'startLoading' })
    await config.setTestMode(!isTestMode)
    await refreshConfig()
    dispatchAppState({ type: 'endLoading' })
  }

  const unconfigureServer = useCallback(async () => {
    dispatchAppState({ type: 'startLoading' })
    try {
      await config.setElection(undefined)
      endBallotStatusPolling()
      await refreshConfig()
    } catch (error) {
      debug('failed unconfigureServer()', error)
    } finally {
      dispatchAppState({ type: 'endLoading' })
    }
  }, [refreshConfig])

  const processCard = useCallback(
    async ({ longValueExists, shortValue: cardShortValue }: CardPresentAPI) => {
      const cardData: CardData = JSON.parse(cardShortValue!)
      if (!electionDefinition && cardData.t !== 'admin') {
        return
      }
      switch (cardData.t) {
        case 'voter': {
          dispatchAppState({
            type: 'invalidCard',
          })
          break
        }
        case 'pollworker': {
          // TODO(caro) Properly process pollworker cards
          dispatchAppState({
            type: 'invalidCard',
          })
          break
        }
        case 'admin': {
          /* istanbul ignore else */
          if (longValueExists) {
            dispatchAppState({
              type: 'processAdminCard',
              electionHash: (cardData as AdminCardData).h,
            })
          }
          break
        }
        default: {
          dispatchAppState({
            type: 'invalidCard',
          })
          break
        }
      }
    },
    [card, electionDefinition]
  )

  const cardShortValueReadInterval = useInterval(async () => {
    if (!hasCardReaderAttached) {
      return
    }
    const insertedCard = await card.readStatus()

    // we compare last card and current card without the longValuePresent flag
    // otherwise when we first write the ballot to the card, it reprocesses it
    // and may cause a race condition where an old ballot on the card
    // overwrites a newer one in memory.
    //
    // TODO: embed a card dip UUID in the card data string so even an unlikely
    // identical card swap within 200ms is always detected.
    // https://github.com/votingworks/module-smartcards/issues/59
    const cardCopy = {
      ...insertedCard,
      longValueExists: undefined, // override longValueExists (see above comment)
    }
    const currentCardDataString = JSON.stringify(cardCopy)
    if (currentCardDataString === lastCardDataString) {
      return
    }

    dispatchAppState({
      type: 'updateLastCardDataString',
      currentCardDataString,
    })

    if (insertedCard.present) {
      processCard(insertedCard)
    } else if (hasCardInserted) {
      dispatchAppState({ type: 'cardRemoved' })
    }
  }, CARD_POLLING_INTERVAL)
  const startCardShortValueReadPolling = useCallback(
    cardShortValueReadInterval[0],
    [card]
  )
  const stopCardShortValueReadPolling = useCallback(
    cardShortValueReadInterval[1],
    [card]
  )

  useEffect(() => {
    const hardwareStatusSubscription = hardware.devices
      .pipe(map((devices) => Array.from(devices)))
      .subscribe(async (devices) => {
        const hasCardReaderAttached = devices.some(isCardReader)
        dispatchAppState({
          type: 'updateHardwareState',
          hasCardReaderAttached,
        })
      })
    return () => {
      hardwareStatusSubscription.unsubscribe()
    }
  }, [hardware])

  // Initilize app state
  useEffect(() => {
    startUsbStatusPolling()
    startCardShortValueReadPolling()
    return () => {
      stopCardShortValueReadPolling()
      stopUsbStatusPolling()
    }
  }, [startUsbStatusPolling, startCardShortValueReadPolling])

  const updatePrecinctId = (precinctId: string) => {
    dispatchAppState({ type: 'updatePrecinctId', precinctId })
  }

  if (!hasCardReaderAttached) {
    return <SetupCardReaderPage />
  }

  if (!isScannerConfigured) {
    return <LoadingConfigurationScreen />
  }

  if (isLoading) {
    // TODO(caro) make this a modal or spinning icon or something better?
    return <LoadingScreen />
  }

  if (!electionDefinition) {
    return (
      <UnconfiguredElectionScreen
        usbDriveStatus={usbDriveStatus}
        setElectionDefinition={setElectionDefinition}
      />
    )
  }

  const dismissError = () => {
    /* istanbul ignore next */
    if (timeoutToInsertScreen) {
      window.clearTimeout(timeoutToInsertScreen)
    }
    dispatchAppState({ type: 'readyToInsertBallot' })
  }

  if (invalidCardPresent) {
    return <InvalidCardScreen />
  }

  if (isAdminCardPresent) {
    return (
      <AdminScreen
        appPrecinctId={currentPrecinctId}
        updateAppPrecinctId={updatePrecinctId}
        ballotsScannedCount={scannedBallotCount}
        electionDefinition={electionDefinition}
        isLiveMode={!isTestMode}
        toggleLiveMode={toggleTestMode}
        unconfigure={unconfigureServer}
      />
    )
  }

  // TODO(caro): After implementing pollworker screens, we should check whether polls are opened
  // or closed and possibly return the PollsClosedScreen here.

  // The polls are open for voters to utilize.
  switch (ballotState) {
    case BallotState.IDLE:
      return (
        <InsertBallotScreen
          electionDefinition={electionDefinition}
          scannedBallotCount={scannedBallotCount}
        />
      )
    case BallotState.SCANNING:
      return <ScanProcessingScreen />
    case BallotState.NEEDS_REVIEW:
      return (
        <ScanWarningScreen
          acceptBallot={acceptBallot}
          adjudicationReasons={adjudicationReasons}
        />
      )
    case BallotState.CAST:
      return (
        <ScanSuccessScreen
          electionDefinition={electionDefinition}
          scannedBallotCount={scannedBallotCount}
        />
      )
    case BallotState.SCANNER_ERROR:
      return (
        <ScanErrorScreen dismissError={dismissError} isTestMode={isTestMode} />
      )
    case BallotState.REJECTED:
      return (
        <ScanErrorScreen
          rejectionReason={rejectionReason}
          isTestMode={isTestMode}
        />
      )
    /* istanbul ignore next */
    default:
      throwIllegalValue(ballotState)
  }
}

export default AppRoot
