import React, { useContext } from 'react';
import { LinkButton, Prose } from '@votingworks/ui';

import { NavigationScreen } from '../components/navigation_screen';
import { routerPaths } from '../router_paths';
import { ZeroReportPrintButton } from '../components/zero_report_print_button';
import { FullTestDeckTallyReportButton } from '../components/full_test_deck_tally_report_button';
import { AppContext } from '../contexts/app_context';

export function LogicAndAccuracyScreen(): JSX.Element {
  const { castVoteRecordFiles } = useContext(AppContext);
  const isLiveMode = castVoteRecordFiles?.fileMode === 'live';

  return (
    <NavigationScreen>
      <Prose maxWidth={false}>
        <h1>L&amp;A Materials</h1>
        {isLiveMode ? (
          <p>
            L&amp;A materials are not available after live CVRs have been
            imported.
          </p>
        ) : (
          <React.Fragment>
            <ZeroReportPrintButton />
            <p>
              <LinkButton to={routerPaths.testDecks}>
                Print L&amp;A Packages
              </LinkButton>
            </p>
            <FullTestDeckTallyReportButton />
          </React.Fragment>
        )}
      </Prose>
    </NavigationScreen>
  );
}
