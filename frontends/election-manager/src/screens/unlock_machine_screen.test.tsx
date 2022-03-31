import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderInAppContext } from '../../test/render_in_app_context';
import { UnlockMachineScreen } from './unlock_machine_screen';

test('authentication', async () => {
  const attemptToAuthenticateAdminUser = jest.fn();

  renderInAppContext(<UnlockMachineScreen />, {
    attemptToAuthenticateAdminUser,
  });
  screen.getByText('- - - - - -');

  // set up a failed attempt
  attemptToAuthenticateAdminUser.mockReturnValueOnce(false);

  userEvent.click(screen.getByText('0'));
  screen.getByText('• - - - - -');

  userEvent.click(screen.getByText('✖'));
  screen.getByText('- - - - - -');

  userEvent.click(screen.getByText('0'));
  screen.getByText('• - - - - -');

  userEvent.click(screen.getByText('1'));
  screen.getByText('• • - - - -');

  userEvent.click(screen.getByText('2'));
  screen.getByText('• • • - - -');

  userEvent.click(screen.getByText('3'));
  screen.getByText('• • • • - -');

  userEvent.click(screen.getByText('4'));
  screen.getByText('• • • • • -');

  userEvent.click(screen.getByText('⌫'));
  screen.getByText('• • • • - -');

  userEvent.click(screen.getByText('4'));
  screen.getByText('• • • • • -');

  userEvent.click(screen.getByText('5'));
  screen.getByText('• • • • • •');

  await waitFor(() =>
    expect(attemptToAuthenticateAdminUser).toHaveBeenNthCalledWith(1, '012345')
  );

  screen.getByText('Invalid code. Please try again.');

  // set up a successful attempt
  attemptToAuthenticateAdminUser.mockReturnValueOnce(true);

  for (let i = 0; i < 6; i += 1) {
    userEvent.click(screen.getByText('0'));
  }

  await waitFor(() =>
    expect(attemptToAuthenticateAdminUser).toHaveBeenNthCalledWith(2, '000000')
  );

  expect(screen.queryByText('Invalid code. Please try again.')).toBeNull();
});
