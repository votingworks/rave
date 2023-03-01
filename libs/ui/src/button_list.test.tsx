import React from 'react';
import { render } from '../test/react_testing_library';

import { Button } from './button';
import { ButtonList } from './button_list';

test('Renders ButtonList with defaults', () => {
  const { container } = render(
    <ButtonList>
      <Button onPress={jest.fn()}>foo</Button>
      <Button onPress={jest.fn()}>foo</Button>
      <Button onPress={jest.fn()}>foo</Button>
    </ButtonList>
  );
  expect(container.firstChild).toMatchSnapshot();
});
