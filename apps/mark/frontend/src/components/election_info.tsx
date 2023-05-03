import React from 'react';
import styled from 'styled-components';

import {
  BallotStyleId,
  ElectionDefinition,
  getPartyPrimaryAdjectiveFromBallotStyle,
  PrecinctSelection,
} from '@votingworks/types';
import { getPrecinctSelectionName, format } from '@votingworks/utils';

import { Prose, NoWrap, H1, H5, P, Caption } from '@votingworks/ui';
import pluralize from 'pluralize';
import { Seal } from './seal';

const VerticalContainer = styled.div`
  display: block;
  margin: auto;
  div:first-child {
    margin: 0 auto 0.5rem;
  }
`;

const CenterinBlock = styled.div`
  display: flex;
  margin: 1.5rem 1rem 0;
`;

const HorizontalContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: auto;
  div:first-child {
    margin-right: 1rem;
    min-width: 5rem;
  }
`;

interface Props {
  electionDefinition: ElectionDefinition;
  precinctSelection?: PrecinctSelection;
  ballotStyleId?: BallotStyleId;
  horizontal?: boolean;
  ariaHidden?: boolean;
  contestCount?: number;
}

export function ElectionInfo({
  electionDefinition,
  precinctSelection,
  ballotStyleId,
  horizontal = false,
  ariaHidden = true,
  contestCount,
}: Props): JSX.Element {
  const { election } = electionDefinition;
  const { title: t, state, county, date, seal, sealUrl } = election;
  const precinctName =
    precinctSelection &&
    getPrecinctSelectionName(election.precincts, precinctSelection);
  const partyPrimaryAdjective = ballotStyleId
    ? getPartyPrimaryAdjectiveFromBallotStyle({
        election,
        ballotStyleId,
      })
    : '';
  const title = `${partyPrimaryAdjective} ${t}`;
  const electionDate = format.localeLongDate(new Date(date));
  if (horizontal) {
    return (
      <CenterinBlock aria-hidden={ariaHidden} data-testid="election-info">
        <HorizontalContainer>
          <Seal seal={seal} sealUrl={sealUrl} />
          <Prose compact>
            <H5 aria-label={`${title}.`}>{title}</H5>
            <P>
              <Caption>
                {electionDate}
                <br />
                <NoWrap>{county.name},</NoWrap> <NoWrap>{state}</NoWrap>
              </Caption>
            </P>
            {precinctName && (
              <Caption>
                <NoWrap>
                  {precinctName}
                  {ballotStyleId && ', '}
                </NoWrap>
                {ballotStyleId && <NoWrap>ballot style {ballotStyleId}</NoWrap>}
              </Caption>
            )}
          </Prose>
        </HorizontalContainer>
      </CenterinBlock>
    );
  }
  return (
    <VerticalContainer aria-hidden={ariaHidden}>
      <Seal seal={seal} sealUrl={sealUrl} />
      <Prose textCenter>
        <H1 aria-label={`${title}.`}>{title}</H1>
        <P
          aria-label={`${electionDate}. ${state}, ${county.name}. ${precinctName}.`}
        >
          {electionDate}
          <br />
          {state}
          <br />
          {county.name}
          {precinctName && <br />}
          {precinctName && (
            <strong>
              <NoWrap>{precinctName}</NoWrap>{' '}
              {ballotStyleId && <NoWrap>({ballotStyleId})</NoWrap>}
            </strong>
          )}
        </P>
        {contestCount && (
          <React.Fragment>
            <hr />
            <P>
              Your ballot has{' '}
              <strong>{pluralize('contest', contestCount, true)}</strong>.
            </P>
          </React.Fragment>
        )}
      </Prose>
    </VerticalContainer>
  );
}
