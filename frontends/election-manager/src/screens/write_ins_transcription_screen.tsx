import React, { useRef, useState } from 'react';
import styled from 'styled-components';

import {
  Adjudication,
  CandidateContest,
  Election,
  getPartyAbbreviationByPartyId,
  Rect,
} from '@votingworks/types';
import {
  Button,
  Main,
  Screen,
  Text,
  CroppedImage,
  Prose,
  HorizontalRule,
} from '@votingworks/ui';
import { assert } from '@votingworks/utils';
import { Navigation } from '../components/navigation';
import { InlineForm, TextInput } from '../components/text_input';
import { useWriteInImageQuery } from '../hooks/use_write_in_images_query';

const BallotViews = styled.div`
  flex: 3;
  background: #455a64;
  padding-right: 0.5rem;
`;

const TranscriptionControls = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  border-left: 1px solid #cccccc;
  button:focus {
    outline: 1px dashed #000000;
  }
`;

const TranscriptionPagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #cccccc;
  background: #ffffff;
  width: 100%;
  padding: 0.5rem 1rem;
  button {
    flex: 1;
  }
  p {
    flex: 2;
  }
`;

const TranscriptionHeader = styled.div`
  border-bottom: 1px solid #cccccc;
  background: #ffffff;
  width: 100%;
  padding: 0.5rem 1rem;
`;

const TranscriptionForm = styled.div`
  overflow: scroll;
  padding: 1rem;
`;

const TranscribedButtons = styled.div`
  margin-bottom: -0.5rem;
  button {
    margin: 0 0.5rem 0.5rem 0;
  }
`;

function WriteInImage({
  imageUrl,
  bounds,
  width,
  margin = 0,
}: {
  imageUrl: string;
  bounds: Rect;
  width?: string;
  margin?: number;
}) {
  return (
    <CroppedImage
      src={imageUrl}
      alt="write-in area"
      crop={{
        x: bounds.x,
        y: bounds.y - bounds.height * margin,
        width: bounds.width,
        height: bounds.height * (1 + 2 * margin),
      }}
      style={{ width: width || '100%' }}
    />
  );
}

interface Props {
  contest: CandidateContest;
  election: Election;
  adjudications: readonly Adjudication[];
  onClose: () => void;
  saveTranscribedValue: (
    adjudicationId: string,
    transcribedValue: string
  ) => void;
}

export function WriteInsTranscriptionScreen({
  contest,
  election,
  adjudications,
  onClose,
  saveTranscribedValue,
}: Props): JSX.Element {
  assert(contest);
  assert(election);

  const transcribedValueInput = useRef<HTMLInputElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const firstTranscriptionButton = useRef<HTMLButtonElement>(null);

  function getTranscribedValues(
    adjudicationSet: readonly Adjudication[]
  ): Set<string> {
    return new Set(
      adjudicationSet
        .map(({ transcribedValue }) => transcribedValue)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
    );
  }

  const previouslyTranscribedValues = getTranscribedValues(adjudications);
  const [cannedTranscriptions, setCannedTranscriptions] = useState(
    previouslyTranscribedValues
  );

  const [showNewTranscriptionForm, setShowNewTranscriptionForm] = useState(
    !cannedTranscriptions.size
  );

  const [offset, setOffset] = useState(0);
  function goPrevious() {
    setCannedTranscriptions(getTranscribedValues(adjudications));
    setOffset((v) => v - 1);
    setShowNewTranscriptionForm(false);
  }
  function goNext() {
    setCannedTranscriptions(getTranscribedValues(adjudications));
    setOffset((v) => v + 1);
    setShowNewTranscriptionForm(false);
    nextButton.current?.blur();
    firstTranscriptionButton.current?.focus();
  }
  const currentAdjudication = adjudications[offset];
  const currentTranscribedValue = currentAdjudication.transcribedValue;
  const adjudicationId = currentAdjudication.id;

  function onPressSetTranscribedValue(val: string): void {
    saveTranscribedValue(adjudicationId, val);
    setTimeout(() => {
      nextButton.current?.focus();
    }, 0);
  }
  function hideAddNewTranscriptionWhenEmpty() {
    const val = transcribedValueInput.current?.value || '';
    if (val === '') {
      setShowNewTranscriptionForm(false);
    }
  }
  const imageDataQuery = useWriteInImageQuery({
    writeInId: currentAdjudication.id,
  });
  const imageData = imageDataQuery.data ? imageDataQuery.data[0] : undefined;

  function onSave() {
    const val = transcribedValueInput.current?.value || '';
    onPressSetTranscribedValue(val);
    if (val !== '') {
      setCannedTranscriptions(
        (prev) => new Set([...prev, val].sort((a, b) => a.localeCompare(b)))
      );
    }

    setShowNewTranscriptionForm(false);
  }

  const isLastTranscription = offset >= adjudications.length - 1;
  const isDoneTranscribing = isLastTranscription && !!currentTranscribedValue;

  return (
    <Screen>
      <Navigation
        screenTitle="Write-In Transcription"
        secondaryNav={
          <Button small primary={isDoneTranscribing} onPress={onClose}>
            Done
          </Button>
        }
      />
      <Main flexRow data-testid={`transcribe:${adjudicationId}`}>
        <BallotViews>
          {imageData && (
            <React.Fragment>
              <WriteInImage
                imageUrl={`data:image/png;base64,${imageData.image}`}
                bounds={imageData.contestCoordinates}
                margin={0.1}
              />
              <div style={{ display: 'flex', paddingTop: '0.5rem' }}>
                <div style={{ flex: 0.9 }}>
                  <WriteInImage
                    // eslint-disable-next-line
                imageUrl={`data:image/png;base64,${imageData.image}`}
                    bounds={imageData.ballotCoordinates}
                  />
                </div>
                <div style={{ flex: 1, paddingLeft: '0.5rem' }}>
                  <WriteInImage
                    imageUrl={`data:image/png;base64,${imageData.image}`}
                    bounds={imageData.writeInCoordinates}
                    margin={0.2}
                  />
                </div>
              </div>
            </React.Fragment>
          )}
        </BallotViews>
        <TranscriptionControls>
          <TranscriptionPagination>
            <Button disabled={offset === 0} onPress={goPrevious}>
              Previous
            </Button>
            <Text center>
              {offset + 1} of {adjudications.length}
            </Text>
            {isLastTranscription ? (
              <Button
                ref={nextButton}
                primary={isDoneTranscribing}
                onPress={onClose}
              >
                Done
              </Button>
            ) : (
              <Button
                ref={nextButton}
                primary={!!currentTranscribedValue}
                onPress={goNext}
              >
                Next
              </Button>
            )}
          </TranscriptionPagination>
          <TranscriptionHeader>
            <Prose>
              {contest.section !== contest.title && (
                <Text bold>{contest.section}</Text>
              )}
              <h1>
                {contest.title}
                {contest.partyId &&
                  `(${getPartyAbbreviationByPartyId({
                    partyId: contest.partyId,
                    election,
                  })})`}
              </h1>
              <p>
                Adjudication ID:{' '}
                <strong>{adjudicationId.substring(0, 4)}</strong>
              </p>
            </Prose>
          </TranscriptionHeader>
          <TranscriptionForm>
            <Prose>
              {!!cannedTranscriptions.size && (
                <TranscribedButtons>
                  {[...cannedTranscriptions].map((val, i) => (
                    <Button
                      key={val}
                      ref={i === 0 ? firstTranscriptionButton : undefined}
                      primary={val === currentTranscribedValue}
                      onPress={() => onPressSetTranscribedValue(val)}
                    >
                      {val}
                    </Button>
                  ))}
                </TranscribedButtons>
              )}
              <HorizontalRule color="#cccccc" />
              <p>
                {showNewTranscriptionForm ? (
                  <InlineForm>
                    <TextInput
                      ref={transcribedValueInput}
                      placeholder="transcribed write-in"
                      autoFocus
                      onBlur={hideAddNewTranscriptionWhenEmpty}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          onSave();
                        }
                      }}
                    />
                    <Button onPress={onSave}>Add</Button>
                  </InlineForm>
                ) : (
                  <Button onPress={() => setShowNewTranscriptionForm(true)}>
                    Add new transcription
                  </Button>
                )}
              </p>
            </Prose>
          </TranscriptionForm>
        </TranscriptionControls>
      </Main>
    </Screen>
  );
}
