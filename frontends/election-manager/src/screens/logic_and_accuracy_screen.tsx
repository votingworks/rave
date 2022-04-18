import React from 'react';
import { LinkButton } from '@votingworks/ui';

import { NavigationScreen } from '../components/navigation_screen';
import { Prose } from '../components/prose';
import { routerPaths } from '../router_paths';
import { ZeroReportPrintButton } from '../components/zero_report_print_button';

export function LogicAndAccuracyScreen(): JSX.Element {
  return (
    <NavigationScreen>
      <Prose maxWidth={false}>
        <h1>L&amp;A Materials</h1>
        <p>
          <ZeroReportPrintButton />
        </p>
        <p>
          <LinkButton to={routerPaths.printTestDecks}>
            Print Test Decks
          </LinkButton>{' '}
          <LinkButton to={routerPaths.testDecksTally}>
            View Test Ballot Deck Tally
          </LinkButton>
        </p>
      </Prose>
    </NavigationScreen>
  );
}
