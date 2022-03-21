import { GridLayout } from '@votingworks/types';
import { assert } from '@votingworks/utils';
import { BallotCardGeometry } from '../accuvote';
import {
  binarize,
  matchTemplateImage,
  scoreTemplateMatch,
  simpleRemoveNoise,
} from '../images';
import { computeTimingMarkGrid } from '../timing_marks';
import {
  InterpretedOvalMark,
  ScannedBallotBackPageLayout,
  ScannedBallotFrontPageLayout,
} from '../types';
import { loc, makeRect, vec } from '../utils';

/**
 * Interprets a ballot scan page's oval marks.
 */
export function interpretOvalMarks({
  geometry,
  ovalTemplate,
  frontImageData,
  backImageData,
  frontLayout,
  backLayout,
  gridLayout,
}: {
  geometry: BallotCardGeometry;
  ovalTemplate: ImageData;
  frontImageData: ImageData;
  backImageData: ImageData;
  frontLayout: ScannedBallotFrontPageLayout;
  backLayout: ScannedBallotBackPageLayout;
  gridLayout: GridLayout;
}): InterpretedOvalMark[] {
  const ovalMask = binarize(ovalTemplate);
  const frontGrid = computeTimingMarkGrid(frontLayout.completeMarks);
  const backGrid = computeTimingMarkGrid(backLayout.completeMarks);

  return gridLayout.gridPositions.map<InterpretedOvalMark>((gridPosition) => {
    const [imageData, grid] =
      gridPosition.side === 'front'
        ? [frontImageData, frontGrid]
        : [backImageData, backGrid];

    const ovalCenter = grid.rows[gridPosition.row]?.[gridPosition.column];
    assert(
      ovalCenter,
      `Missing oval center for side=${gridPosition.side}, column=${
        gridPosition.column
      }, row=${gridPosition.row}, contestId=${gridPosition.contestId} ${
        gridPosition.type === 'option'
          ? `optionId=${gridPosition.optionId}`
          : `writeInIndex=${gridPosition.writeInIndex}`
      }`
    );

    const ovalTopLeftPoint = loc(
      Math.floor(ovalCenter.x - geometry.ovalSize.width / 2),
      Math.floor(ovalCenter.y - geometry.ovalSize.height / 2)
    );
    let minimumScore = 1;
    let minimumScoreRect = makeRect({
      minX: ovalTopLeftPoint.x,
      minY: ovalTopLeftPoint.y,
      maxX: ovalTopLeftPoint.x + geometry.ovalSize.width - 1,
      maxY: ovalTopLeftPoint.y + geometry.ovalSize.height - 1,
    });
    let minimumScoredOffset = vec(0, 0);
    for (let xOffset = -3; xOffset <= 3; xOffset += 1) {
      for (let yOffset = -3; yOffset <= 3; yOffset += 1) {
        const x = ovalTopLeftPoint.x + xOffset;
        const y = ovalTopLeftPoint.y + yOffset;
        const ovalRect = makeRect({
          minX: x,
          minY: y,
          maxX: x + geometry.ovalSize.width - 1,
          maxY: y + geometry.ovalSize.height - 1,
        });
        const ovalMatch = simpleRemoveNoise(
          binarize(matchTemplateImage(imageData, ovalTemplate, loc(x, y))),
          255,
          2
        );
        const score = scoreTemplateMatch(ovalMatch, ovalMask);
        if (score < minimumScore) {
          minimumScore = score;
          minimumScoreRect = ovalRect;
          minimumScoredOffset = vec(xOffset, yOffset);
        }
      }
    }

    return {
      gridPosition,
      score: minimumScore,
      bounds: minimumScoreRect,
      scoredOffset: minimumScoredOffset,
    };
  });
}
