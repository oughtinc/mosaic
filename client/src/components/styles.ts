import { css } from "styled-components";

const darkBlue = "#337ab7";
const headerBgColor = darkBlue;

const white = "#fff";
const brandFontColor = white;
const headerLinkFontColor = white;

// 16px
const brandFontSize = "16px";
const headerLinkFontSize = "16px";

// 600
const brandFontWeight = 600;

export const HeaderContainerCSS = css`
  background-color: ${headerBgColor};
`;

export const BrandCSS = css`
  color: ${brandFontColor};
  font-size: ${brandFontSize};
  font-weight: ${brandFontWeight};
`;

export const HeaderLinkCSS = css`
  color: ${headerLinkFontColor};
  font-size: ${headerLinkFontSize};

  &:hover,
  &:active,
  &:visited {
    color: ${headerLinkFontColor};
  }
`;
