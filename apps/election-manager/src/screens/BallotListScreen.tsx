import { strict as assert } from 'assert';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import pluralize from 'pluralize';
import moment from 'moment';

import { find } from '@votingworks/utils';
import { Table, TD } from '@votingworks/ui';
import AppContext from '../contexts/AppContext';

import routerPaths from '../routerPaths';
import Button, { SegmentedButton } from '../components/Button';
import LinkButton from '../components/LinkButton';
import { NoWrap } from '../components/Text';
import Prose from '../components/Prose';
import {
  getBallotStylesData,
  sortBallotStyleDataByPrecinct,
  sortBallotStyleDataByStyle,
} from '../utils/election';
import NavigationScreen from '../components/NavigationScreen';
import ExportElectionBallotPackageModalButton from '../components/ExportElectionBallotPackageModalButton';

const Header = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

function BallotListScreen(): JSX.Element {
  const { electionDefinition, printedBallots, configuredAt } = useContext(
    AppContext
  );
  assert(electionDefinition);
  const { election } = electionDefinition;

  const allBallotStyles = getBallotStylesData(election);
  const ballotLists = [
    sortBallotStyleDataByStyle(election, allBallotStyles),
    sortBallotStyleDataByPrecinct(election, allBallotStyles),
  ];
  const [ballotView, setBallotView] = useState(1);
  function sortByStyle() {
    return setBallotView(0);
  }
  function sortByPrecinct() {
    return setBallotView(1);
  }

  const ballots = ballotLists[ballotView];

  const numBallotsPrinted = printedBallots.reduce(
    (count, ballot) => count + ballot.numCopies,
    0
  );

  return (
    <NavigationScreen>
      <Header>
        <Prose maxWidth={false}>
          <p>
            <strong>
              {pluralize('official ballot', numBallotsPrinted, true)}{' '}
            </strong>{' '}
            printed since configuration at{' '}
            {moment(new Date(configuredAt)).format('MMM D, YYYY [at] h:mma')}.{' '}
            <LinkButton small to={routerPaths.printedBallotsReport}>
              Printed Ballots Report
            </LinkButton>{' '}
            <ExportElectionBallotPackageModalButton />
          </p>
        </Prose>
        <Prose maxWidth={false}>
          <p>
            {`Sort ${pluralize('ballot', ballots.length, true)} by: `}
            <SegmentedButton>
              <Button
                small
                onPress={sortByPrecinct}
                disabled={ballotView === 1}
              >
                Precinct
              </Button>
              <Button small onPress={sortByStyle} disabled={ballotView === 0}>
                Style
              </Button>
            </SegmentedButton>
          </p>
        </Prose>
      </Header>
      <Table>
        <thead>
          <tr>
            <TD as="th" />
            <TD as="th">Precinct</TD>
            <TD as="th">Ballot Style</TD>
            <TD as="th">Contests</TD>
          </tr>
        </thead>
        <tbody>
          {ballots.map((ballot) => {
            const precinctName = find(
              election.precincts,
              (p) => p.id === ballot.precinctId
            ).name;
            return (
              <tr key={ballot.ballotStyleId + ballot.precinctId}>
                <TD textAlign="right" nowrap>
                  <LinkButton
                    fullWidth
                    small
                    to={routerPaths.ballotsView(ballot)}
                  >
                    View Ballot
                  </LinkButton>
                </TD>
                <TD>
                  <NoWrap>{precinctName}</NoWrap>
                </TD>
                <TD>{ballot.ballotStyleId}</TD>
                <TD>{ballot.contestIds.length}</TD>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </NavigationScreen>
  );
}

export default BallotListScreen;
