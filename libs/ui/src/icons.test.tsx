import React from 'react';
import { render } from '../test/react_testing_library';

import { Icons } from './icons';

for (const [name, Component] of Object.entries(Icons)) {
  if (typeof Component !== 'function') {
    continue;
  }

  test(`Icons.${name} renders with no props`, () => {
    const { container } = render(<Component />);

    expect(container.firstChild).not.toBeEmptyDOMElement();
  });
}
