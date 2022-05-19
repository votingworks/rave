import styled from 'styled-components';
import { Theme } from './themes';

export interface ProseProps {
  theme?: Theme;
  compact?: boolean;
  maxWidth?: boolean;
  textCenter?: boolean;
  textRight?: boolean;
}

export const Prose = styled('div')<ProseProps>`
  margin: ${({ textCenter }) => (textCenter ? '0 auto' : undefined)};
  max-width: ${({ maxWidth = true }) => (maxWidth ? '66ch' : undefined)};
  text-align: ${({ textCenter, textRight }) =>
    (textCenter && 'center') || (textRight && 'right')};
  line-height: 1.2;
  color: ${({ theme }) => theme.color};
  font-size: ${({ theme }) => theme.fontSize};
  & h1 {
    margin: 2em 0 1em;
    line-height: 1.1;
    font-size: 1.5em;
  }
  & h2 {
    margin: 1.5em 0 0.75em;
    font-size: 1.25em;
  }
  & h3 {
    font-size: 1.17em;
  }
  & h4 {
    font-size: 1em;
  }
  & h5 {
    font-size: 0.9em;
  }
  & h3,
  & h4,
  & h5,
  & p,
  & ol,
  & ul,
  & hr {
    margin-top: ${({ compact }) => (compact ? '0' : '1em')};
    margin-bottom: ${({ compact }) => (compact ? '0' : '1em')};
  }
  & h1 + h2 {
    margin-top: -0.75em;
  }
  & h1,
  & h2 {
    & + p,
    & + ol,
    & + ul {
      margin-top: -0.75em;
    }
  }
  & h3,
  & h4,
  & h5 {
    & + p,
    & + ol,
    & + ul {
      margin-top: ${({ compact }) => (compact ? 0 : '-1em')};
    }
  }
  & > :not(.ignore-prose):first-child {
    margin-top: 0;
  }
  & > :not(.ignore-prose):last-child {
    margin-bottom: 0;
  }
  & dl {
    margin: 1em 0;
  }
  & hr {
    border: 0;
    border-top: 0.1em solid #666666;
  }
`;
