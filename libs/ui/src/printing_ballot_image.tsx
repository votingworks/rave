/* stylelint-disable order/properties-order */
import styled, { keyframes } from 'styled-components';

import { Svg } from './svg';

// HACK: The content was originally drawn on a 512x512 canvas, but had a lot
// of empty room on the x-axis - the viewBox width has been reduced to 395 to
// fit the content better and this transform is here to avoid the trouble of
// having to re-export this image for editing.
const Content = styled.g`
  transform: translateX(-15%);
`;

const ForegroundLine = styled.line`
  stroke: ${(p) => p.theme.colors.foreground};
  stroke-width: 5px;
`;

const ballotFeedAnimationKeyframes = keyframes`
  0% {
    opacity: 1;
    transform: translateY(20%);
  }
  60% {
    opacity: 1;
    transform: translateY(0%);
  }
  90% {
    opacity: 0;
    transform: translateY(0%);
  }
  91% {
    opacity: 0;
    transform: translateY(20%);
  }
  100% {
    opacity: 1;
    transform: translateY(20%);
  }
`;

const BallotSheetGroup = styled.g`
  animation: ${ballotFeedAnimationKeyframes} 3s ease-in-out infinite;
`;

const BallotSheetBackground = styled.rect`
  fill: ${(p) => p.theme.colors.background};
`;

interface BubbleProps {
  filled?: boolean;
}

const Bubble = styled.ellipse.attrs({ rx: 18, ry: 10 })<BubbleProps>`
  fill: ${(p) => (p.filled ? p.theme.colors.foreground : 'none')};
  stroke: ${(p) => p.theme.colors.foreground};
  stroke-linejoin: round;
  stroke-width: 3px;
`;

export function PrintingBallotImage(): JSX.Element {
  return (
    <Svg.FullScreenSvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 395 512">
      <defs>
        <clipPath id="PrintingBallotImage--ballot-sheet-mask">
          <rect x="0" y="0" width="395" height="315" />
        </clipPath>
      </defs>
      <Content>
        <g>
          <Svg.PurpleFillPath d="M229.54 130.4H282.46V73.1199H309.61L256 5.06995L202.39 73.1199H229.54V130.4Z" />
          <Svg.PurpleFillPath d="M282.46 135.57H229.54C228.166 135.57 226.849 135.024 225.877 134.053C224.906 133.081 224.36 131.764 224.36 130.39V78.29H202.36C201.388 78.2913 200.435 78.0185 199.61 77.5027C198.786 76.9869 198.124 76.2492 197.7 75.3741C197.276 74.4991 197.108 73.5222 197.214 72.5557C197.32 71.5892 197.696 70.6722 198.3 69.91L251.91 1.90995C252.412 1.32297 253.036 0.851728 253.737 0.528621C254.439 0.205513 255.203 0.038208 255.975 0.038208C256.748 0.038208 257.511 0.205513 258.213 0.528621C258.914 0.851728 259.538 1.32297 260.04 1.90995L313.65 69.91C314.254 70.6722 314.63 71.5892 314.736 72.5557C314.843 73.5222 314.674 74.4991 314.25 75.3741C313.826 76.2492 313.164 76.9869 312.34 77.5027C311.515 78.0185 310.562 78.2913 309.59 78.29H287.59V130.39C287.59 131.755 287.051 133.065 286.091 134.035C285.13 135.005 283.825 135.557 282.46 135.57ZM234.71 125.22H277.28V73.12C277.28 71.7461 277.826 70.4286 278.797 69.4571C279.769 68.4857 281.086 67.94 282.46 67.94H298.94L256 13.43L213.06 67.94H229.54C230.914 67.94 232.231 68.4857 233.203 69.4571C234.174 70.4286 234.72 71.7461 234.72 73.12V125.22H234.71Z" />
        </g>
        <g>
          <Svg.ForegroundFillPath d="M343.129 289.71H168.129C166.748 289.65 165.444 289.06 164.489 288.062C163.533 287.065 163 285.736 163 284.355C163 282.973 163.533 281.645 164.489 280.648C165.444 279.65 166.748 279.06 168.129 279H343.129C344.509 279.06 345.813 279.65 346.768 280.648C347.724 281.645 348.257 282.973 348.257 284.355C348.257 285.736 347.724 287.065 346.768 288.062C345.813 289.06 344.509 289.65 343.129 289.71Z" />
          <Svg.ForegroundFillPath d="M343.52 325.31H168.52C167.14 325.25 165.836 324.66 164.88 323.662C163.925 322.665 163.391 321.336 163.391 319.955C163.391 318.573 163.925 317.245 164.88 316.248C165.836 315.25 167.14 314.66 168.52 314.6H343.52C344.9 314.66 346.204 315.25 347.16 316.248C348.115 317.245 348.648 318.573 348.648 319.955C348.648 321.336 348.115 322.665 347.16 323.662C346.204 324.66 344.9 325.25 343.52 325.31Z" />
          <Svg.ForegroundFillPath d="M386.94 512H125.05C120.128 511.988 115.379 510.186 111.689 506.928C108 503.671 105.622 499.182 105 494.3L94.63 359.16C94.5735 358.424 94.6696 357.684 94.9123 356.987C95.1551 356.29 95.5391 355.651 96.0404 355.109C96.5417 354.568 97.1495 354.135 97.8257 353.839C98.5019 353.544 99.2319 353.391 99.97 353.39H412C412.738 353.391 413.468 353.544 414.144 353.839C414.82 354.135 415.428 354.568 415.93 355.109C416.431 355.651 416.815 356.29 417.058 356.987C417.3 357.684 417.396 358.424 417.34 359.16L407 494C406.435 498.934 404.082 503.49 400.386 506.807C396.69 510.124 391.906 511.971 386.94 512ZM105.75 364.1L115.65 493.21C115.988 495.459 117.124 497.511 118.849 498.993C120.575 500.474 122.776 501.286 125.05 501.28H386.94C389.255 501.274 391.49 500.425 393.225 498.892C394.96 497.359 396.078 495.247 396.37 492.95L406.25 364.1H105.75Z" />
          <Svg.ForegroundFillPath d="M412 364.1H100C99.0652 364.096 98.1477 363.847 97.3387 363.378C96.5297 362.91 95.8573 362.238 95.3882 361.429C94.9192 360.621 94.6698 359.703 94.6649 358.768C94.6599 357.833 94.8996 356.914 95.3601 356.1L132.76 291.45C134.296 287.788 136.883 284.663 140.193 282.468C143.503 280.274 147.389 279.109 151.36 279.12H189.16C190.54 279.18 191.844 279.77 192.8 280.768C193.755 281.765 194.289 283.094 194.289 284.475C194.289 285.856 193.755 287.185 192.8 288.182C191.844 289.18 190.54 289.77 189.16 289.83H151.36C149.458 289.828 147.6 290.399 146.028 291.469C144.457 292.54 143.244 294.06 142.55 295.83C142.453 296.068 142.339 296.298 142.21 296.52L109.29 353.44H402.74L369.82 296.52C369.693 296.298 369.583 296.068 369.49 295.83C368.794 294.059 367.58 292.539 366.006 291.468C364.433 290.398 362.573 289.827 360.67 289.83H322.87C321.49 289.77 320.186 289.18 319.23 288.182C318.275 287.185 317.742 285.856 317.742 284.475C317.742 283.094 318.275 281.765 319.23 280.768C320.186 279.77 321.49 279.18 322.87 279.12H360.67C364.643 279.107 368.531 280.271 371.843 282.466C375.155 284.66 377.743 287.786 379.28 291.45L416.68 356.1C417.142 356.917 417.382 357.84 417.375 358.778C417.368 359.717 417.116 360.637 416.642 361.447C416.168 362.256 415.49 362.928 414.675 363.393C413.861 363.859 412.938 364.103 412 364.1Z" />
          <Svg.ForegroundFillPath d="M404 465.31H108.54C107.817 465.341 107.096 465.226 106.419 464.971C105.742 464.716 105.124 464.326 104.601 463.826C104.079 463.326 103.663 462.725 103.379 462.06C103.095 461.394 102.948 460.678 102.948 459.955C102.948 459.232 103.095 458.516 103.379 457.85C103.663 457.185 104.079 456.584 104.601 456.084C105.124 455.584 105.742 455.194 106.419 454.939C107.096 454.684 107.817 454.569 108.54 454.6H404C405.38 454.66 406.684 455.25 407.64 456.248C408.595 457.245 409.128 458.573 409.128 459.955C409.128 461.336 408.595 462.665 407.64 463.662C406.684 464.66 405.38 465.25 404 465.31Z" />
          <Svg.ForegroundFillPath d="M372.81 405.44C371.052 405.44 369.333 404.919 367.871 403.942C366.409 402.965 365.269 401.576 364.597 399.952C363.924 398.328 363.748 396.54 364.091 394.816C364.434 393.091 365.28 391.507 366.524 390.264C367.767 389.02 369.351 388.174 371.076 387.831C372.8 387.488 374.588 387.664 376.212 388.337C377.836 389.009 379.225 390.149 380.202 391.611C381.179 393.073 381.7 394.792 381.7 396.55C381.697 398.907 380.76 401.167 379.093 402.833C377.427 404.5 375.167 405.437 372.81 405.44ZM372.81 395.09C372.521 395.09 372.239 395.176 371.999 395.336C371.759 395.496 371.572 395.724 371.461 395.991C371.351 396.258 371.322 396.552 371.378 396.835C371.434 397.118 371.573 397.378 371.778 397.582C371.982 397.786 372.242 397.926 372.525 397.982C372.808 398.038 373.102 398.009 373.369 397.899C373.635 397.788 373.863 397.601 374.024 397.361C374.184 397.121 374.27 396.839 374.27 396.55C374.27 396.163 374.116 395.791 373.842 395.518C373.568 395.244 373.197 395.09 372.81 395.09Z" />
          <Svg.ForegroundFillPath d="M372.81 434.55C371.052 434.55 369.333 434.029 367.871 433.052C366.409 432.075 365.269 430.686 364.597 429.062C363.924 427.438 363.748 425.65 364.091 423.926C364.434 422.201 365.28 420.617 366.524 419.374C367.767 418.131 369.351 417.284 371.076 416.941C372.8 416.598 374.588 416.774 376.212 417.447C377.836 418.12 379.225 419.259 380.202 420.721C381.179 422.183 381.7 423.902 381.7 425.66C381.697 428.017 380.76 430.277 379.093 431.943C377.427 433.61 375.167 434.547 372.81 434.55ZM372.81 424.2C372.521 424.2 372.239 424.286 371.999 424.446C371.759 424.606 371.572 424.835 371.461 425.101C371.351 425.368 371.322 425.662 371.378 425.945C371.434 426.228 371.573 426.488 371.778 426.692C371.982 426.897 372.242 427.036 372.525 427.092C372.808 427.148 373.102 427.119 373.369 427.009C373.635 426.898 373.863 426.711 374.024 426.471C374.184 426.231 374.27 425.949 374.27 425.66C374.267 425.275 374.112 424.906 373.839 424.634C373.565 424.362 373.195 424.21 372.81 424.21V424.2Z" />
        </g>
        <g clipPath="url(#PrintingBallotImage--ballot-sheet-mask)">
          <BallotSheetGroup>
            <BallotSheetBackground x="190" y="164" width="132" height="154" />
            <Svg.ForegroundFillPath d="M322.87 325.31H189.13C188.426 325.31 187.729 325.171 187.079 324.902C186.429 324.633 185.838 324.238 185.34 323.74C184.842 323.242 184.447 322.651 184.178 322.001C183.909 321.351 183.77 320.654 183.77 319.95V160.95C183.77 160.246 183.909 159.549 184.178 158.899C184.447 158.248 184.842 157.658 185.34 157.16C185.838 156.662 186.429 156.267 187.079 155.998C187.729 155.729 188.426 155.59 189.13 155.59H322.87C323.574 155.59 324.271 155.729 324.921 155.998C325.571 156.267 326.162 156.662 326.66 157.16C327.158 157.658 327.553 158.248 327.822 158.899C328.091 159.549 328.23 160.246 328.23 160.95V320C328.217 321.413 327.646 322.763 326.643 323.758C325.639 324.752 324.283 325.31 322.87 325.31ZM194.49 314.6H317.49V166.28H194.49V314.6Z" />
            <Svg.ForegroundFillPath d="M204.75 178.07H213.12C214.072 178.062 215.022 178.166 215.95 178.38C216.759 178.55 217.523 178.891 218.19 179.38C218.836 179.894 219.339 180.566 219.65 181.33C220.024 182.285 220.201 183.305 220.17 184.33C220.205 185.551 219.878 186.755 219.23 187.79C218.58 188.788 217.576 189.503 216.42 189.79V189.86C217.71 189.992 218.896 190.628 219.72 191.63C220.582 192.78 221.014 194.195 220.94 195.63C220.945 196.57 220.817 197.506 220.56 198.41C220.316 199.272 219.87 200.064 219.26 200.72C218.587 201.418 217.767 201.958 216.86 202.3C215.685 202.726 214.44 202.927 213.19 202.89H204.75V178.07ZM209.75 188.25H211.17C212.224 188.323 213.274 188.061 214.17 187.5C214.523 187.188 214.797 186.797 214.971 186.359C215.145 185.922 215.213 185.449 215.17 184.98C215.217 184.525 215.164 184.065 215.013 183.633C214.863 183.201 214.619 182.807 214.3 182.48C213.495 181.926 212.523 181.669 211.55 181.75H209.74V188.25H209.75ZM209.75 199.19H211.7C212.733 199.239 213.756 198.959 214.62 198.39C215.036 198.019 215.355 197.551 215.549 197.028C215.742 196.505 215.804 195.943 215.73 195.39C215.75 194.78 215.652 194.172 215.44 193.6C215.268 193.159 214.994 192.765 214.64 192.45C214.294 192.154 213.883 191.945 213.44 191.84C212.939 191.72 212.425 191.663 211.91 191.67H209.76V199.14L209.75 199.19Z" />
            <Svg.ForegroundFillPath d="M228.9 178.07H235.08L241.65 202.88H236.44L235.29 197.63H228.69L227.54 202.88H222.33L228.9 178.07ZM229.56 193.53H234.42L232 182.38L229.56 193.53Z" />
            <Svg.ForegroundFillPath d="M243.39 202.88V178.07H248.39V198.78H257.25V202.88H243.39Z" />
            <Svg.ForegroundFillPath d="M259.48 202.88V178.07H264.48V198.78H273.34V202.88H259.48Z" />
            <Svg.ForegroundFillPath d="M275 190.48C274.992 188.743 275.079 187.007 275.26 185.28C275.387 183.86 275.777 182.477 276.41 181.2C276.982 180.083 277.868 179.158 278.96 178.54C280.375 177.905 281.909 177.577 283.46 177.577C285.011 177.577 286.545 177.905 287.96 178.54C289.052 179.158 289.939 180.083 290.51 181.2C291.143 182.477 291.533 183.86 291.66 185.28C292.006 188.735 292.006 192.215 291.66 195.67C291.533 197.089 291.143 198.473 290.51 199.75C289.939 200.867 289.052 201.792 287.96 202.41C286.545 203.045 285.011 203.373 283.46 203.373C281.909 203.373 280.375 203.045 278.96 202.41C277.868 201.792 276.982 200.867 276.41 199.75C275.777 198.473 275.387 197.089 275.26 195.67C275.079 193.946 274.993 192.213 275 190.48ZM280 190.48C280 192.147 280.04 193.567 280.12 194.74C280.166 195.706 280.33 196.664 280.61 197.59C280.773 198.213 281.121 198.771 281.61 199.19C282.149 199.52 282.768 199.694 283.4 199.694C284.032 199.694 284.651 199.52 285.19 199.19C285.678 198.771 286.027 198.212 286.19 197.59C286.469 196.664 286.634 195.706 286.68 194.74C286.76 193.573 286.8 192.153 286.8 190.48C286.8 188.807 286.76 187.393 286.68 186.24C286.632 185.274 286.468 184.317 286.19 183.39C286.031 182.76 285.681 182.195 285.19 181.77C284.651 181.44 284.032 181.266 283.4 181.266C282.768 181.266 282.149 181.44 281.61 181.77C281.118 182.194 280.769 182.76 280.61 183.39C280.332 184.317 280.168 185.274 280.12 186.24C280.04 187.413 280 188.827 280 190.48Z" />
            <Svg.ForegroundFillPath d="M308.58 178.07V182.17H303.16V202.88H298.16V182.17H292.74V178.07H308.58Z" />
            <ForegroundLine x1="258.5" y1="210" x2="258.5" y2="315" />
            <Bubble filled cx="226" cy="228" />
            <Bubble cx="288" cy="228" />
            <Bubble cx="226" cy="267" />
            <Bubble filled cx="288" cy="267" />
            <Bubble cx="226" cy="306" />
            <Bubble filled cx="288" cy="306" />
          </BallotSheetGroup>
        </g>
      </Content>
    </Svg.FullScreenSvg>
  );
}
