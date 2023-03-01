import React from 'react';
import { render } from '../test/react_testing_library';

import { HorizontalRule } from './horizontal_rule';

describe('Renders HorizontalRule', () => {
  test('with defaults', () => {
    const { container } = render(<HorizontalRule>or</HorizontalRule>);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('with custom green color', () => {
    const { container } = render(
      <HorizontalRule color="#00FF00">or</HorizontalRule>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('without children', () => {
    const { container } = render(<HorizontalRule />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
