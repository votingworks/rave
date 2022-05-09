import React from 'react';
import { render } from '@testing-library/react';

import { QrCode } from './qrcode';

it('renders QRCode', () => {
  const { container } = render(<QrCode value="VX.21.5" />);
  expect(container.firstChild).toMatchSnapshot();
  expect(container.querySelector('path[fill="#000000"]')!)
    .toMatchInlineSnapshot(`
    <path
      d="M0 0h7v1H0zM10 0h3v1H10zM14,0 h7v1H14zM0 1h1v1H0zM6 1h1v1H6zM10 1h1v1H10zM12 1h1v1H12zM14 1h1v1H14zM20,1 h1v1H20zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM8 2h1v1H8zM11 2h1v1H11zM14 2h1v1H14zM16 2h3v1H16zM20,2 h1v1H20zM0 3h1v1H0zM2 3h3v1H2zM6 3h1v1H6zM8 3h2v1H8zM11 3h2v1H11zM14 3h1v1H14zM16 3h3v1H16zM20,3 h1v1H20zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM9 4h2v1H9zM12 4h1v1H12zM14 4h1v1H14zM16 4h3v1H16zM20,4 h1v1H20zM0 5h1v1H0zM6 5h1v1H6zM14 5h1v1H14zM20,5 h1v1H20zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14,6 h7v1H14zM9 7h2v1H9zM12 7h1v1H12zM3 8h2v1H3zM6 8h2v1H6zM9 8h1v1H9zM17 8h2v1H17zM2 9h2v1H2zM8 9h3v1H8zM12 9h2v1H12zM15 9h3v1H15zM20,9 h1v1H20zM1 10h2v1H1zM5 10h3v1H5zM10 10h1v1H10zM15 10h1v1H15zM17 10h1v1H17zM19,10 h2v1H19zM0 11h1v1H0zM2 11h2v1H2zM7 11h1v1H7zM11 11h1v1H11zM13 11h4v1H13zM19 11h1v1H19zM3 12h2v1H3zM6 12h3v1H6zM10 12h2v1H10zM13 12h7v1H13zM8 13h3v1H8zM20,13 h1v1H20zM0 14h7v1H0zM8 14h2v1H8zM11 14h1v1H11zM14 14h1v1H14zM18 14h1v1H18zM20,14 h1v1H20zM0 15h1v1H0zM6 15h1v1H6zM9 15h1v1H9zM18 15h2v1H18zM0 16h1v1H0zM2 16h3v1H2zM6 16h1v1H6zM8 16h1v1H8zM11 16h1v1H11zM13 16h2v1H13zM16 16h1v1H16zM18 16h1v1H18zM20,16 h1v1H20zM0 17h1v1H0zM2 17h3v1H2zM6 17h1v1H6zM8 17h4v1H8zM14 17h1v1H14zM16 17h1v1H16zM18 17h1v1H18zM0 18h1v1H0zM2 18h3v1H2zM6 18h1v1H6zM9 18h1v1H9zM12 18h2v1H12zM15 18h2v1H15zM18,18 h3v1H18zM0 19h1v1H0zM6 19h1v1H6zM10 19h2v1H10zM15 19h1v1H15zM17 19h1v1H17zM19 19h1v1H19zM0 20h7v1H0zM10 20h1v1H10zM12 20h3v1H12zM16 20h1v1H16zM18 20h2v1H18z"
      fill="#000000"
    />
  `);
});
