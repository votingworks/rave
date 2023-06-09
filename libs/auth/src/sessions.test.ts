import { computeSessionEndTime, SessionConfig } from './sessions';

test('computeSessionEndTime with default config params', () => {
  const startTime = new Date();
  const endTime = computeSessionEndTime({}, startTime);
  expect(endTime).toEqual(new Date(startTime.getTime() + 12 * 60 * 60 * 1000));
});

test('computeSessionEndTime with custom config params', () => {
  const customSessionConfig: SessionConfig = {
    overallSessionTimeLimitHours: 2,
  };
  const startTime = new Date();
  const endTime = computeSessionEndTime(customSessionConfig, startTime);
  expect(endTime).toEqual(new Date(startTime.getTime() + 2 * 60 * 60 * 1000));
});
