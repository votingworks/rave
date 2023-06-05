import { throwIllegalValue } from '@votingworks/basics';
import { SetScanParametersRequestData } from './protocol';
import {
  DoubleSheetDetectOpt,
  ImageResolution,
  ScanParameters,
  UltrasonicSensorLevelInternal,
} from './types';

type ResolutionProps = Pick<
  SetScanParametersRequestData,
  | 'resolutionX'
  | 'resolutionY'
  | 'offsetX'
  | 'offsetY'
  | 'imageWidth'
  | 'imageHeight'
>;

const resolutionPropsMap: Record<number, ResolutionProps> = {
  [ImageResolution.RESOLUTION_200_DPI]: {
    resolutionX: ImageResolution.RESOLUTION_200_DPI,
    resolutionY: ImageResolution.RESOLUTION_200_DPI,
    offsetX: 8,
    offsetY: 0,
    imageWidth: 1712,
    imageHeight: 9980,
  },
  [ImageResolution.RESOLUTION_300_DPI]: {
    resolutionX: ImageResolution.RESOLUTION_300_DPI,
    resolutionY: ImageResolution.RESOLUTION_300_DPI,
    offsetX: 12,
    offsetY: 0,
    imageWidth: 2568,
    imageHeight: 14970,
  },
};

/**
 * Converts the high-level double sheet detection parameter to the specific internal ultrasonic level desired
 */
function convertToUltrasonicSensorLevelInternal(
  option: DoubleSheetDetectOpt
): UltrasonicSensorLevelInternal {
  switch (option) {
    case DoubleSheetDetectOpt.Level1:
    case DoubleSheetDetectOpt.DetectOff:
      return UltrasonicSensorLevelInternal.Level1;
    case DoubleSheetDetectOpt.Level2:
      return UltrasonicSensorLevelInternal.Level2;
    case DoubleSheetDetectOpt.Level3:
      return UltrasonicSensorLevelInternal.Level3;
    case DoubleSheetDetectOpt.Level4:
      return UltrasonicSensorLevelInternal.Level4;
    /* c8 ignore next 2 */
    default:
      throwIllegalValue(option);
  }
}

/**
 * Converts the high-level scan parameters to the low-level internal scan parameters.
 */
export function convertToInternalScanParameters(
  scanParameters: ScanParameters
): SetScanParametersRequestData {
  const resolutionProps = resolutionPropsMap[scanParameters.resolution];

  if (!resolutionProps) {
    throw new Error(`Unsupported resolution: ${scanParameters.resolution}`);
  }

  return {
    acquireBackScan: false,
    acquireNoShading: false,
    acquireNoMirror: false,
    acquirePageRead: false,
    acquireAuthThreshold: false,
    acquireDetectColor: false,
    acquireAutoLevel: false,
    acquireAutoColor: false,
    acquireLeftAlign: false,
    acquirePageFill: false,
    acquireCropDeskew: false,
    acquirePseudoSensor: true,
    acquireTestPattern: false,
    acquireLampOff: false,
    acquireNoPaperSensor: true,
    acquireMotorOff: false,
    ultrasonicSensorLevel: convertToUltrasonicSensorLevelInternal(
      scanParameters.doubleSheetDetection
    ),
    disableUltrasonicSensor:
      scanParameters.doubleSheetDetection === DoubleSheetDetectOpt.DetectOff,
    disableHardwareDeskew: true,
    formStandingAfterScan: scanParameters.formStandingAfterScan,
    wantedScanSide: scanParameters.wantedScanSide,
    bitType: scanParameters.imageColorDepth & 0x0f,
    colorMode: (scanParameters.imageColorDepth >> 8) & 0x0f,
    ...resolutionProps,
  };
}
