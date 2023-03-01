import React from 'react';
import { render, screen } from '../test/react_testing_library';

import { TestMode } from './test_mode';

test('renders TestMode', () => {
  const { container } = render(<TestMode />);
  screen.getByText('Machine is in Test Ballot Mode');
  expect(container).toMatchSnapshot();
});
