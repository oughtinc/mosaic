import { css } from "styled-components";

export const WHITE = "#fff";
export const VERY_LIGHT_GRAY = "#f7f7f7";
export const LIGHT_GRAY = "#ddd";
export const GRAY = "#bbb";
export const SLIGHTLY_DARKER_GRAY = "#999";
export const DARK_GRAY = "#666";
export const VERY_LIGHT_BLUE = "#f0f8ff";
export const DARK_BLUE = "#337ab7";
export const VERY_DARK_BLUE = "#26a";

export const blockBodyBgColor = WHITE;
export const blockBorderColor = LIGHT_GRAY;
export const blockHeaderBgColor = VERY_LIGHT_GRAY;
export const editBudgetFormBoxShadow = `0 0 6px ${DARK_GRAY}`;
export const headerBgColor = DARK_BLUE;
export const newQuestionFormFooterBgColor = VERY_LIGHT_GRAY;
export const newQuestionFormBorderTopColor = LIGHT_GRAY;
export const pointerImportNameColor = DARK_BLUE;
export const pointerImportNameColorOnHover = VERY_DARK_BLUE;
export const treeBulletBgColor = WHITE;
export const treeBulletBgColorOnHover = VERY_LIGHT_GRAY;
export const treeBulletArrowColor = GRAY;
export const treeBulletArrowColorWhenActive = SLIGHTLY_DARKER_GRAY;
export const treeWorkspaceBgColor = WHITE;
export const brandFontColor = WHITE;
export const headerLinkFontColor = WHITE;
export const subQuestionAnswerFontColor = SLIGHTLY_DARKER_GRAY;

export const homepageWorkspaceBgColor = WHITE;
export const homepageWorkspaceBorderColor = LIGHT_GRAY;
export const homepageWorkspaceScratchpadFontColor = GRAY;

export const welcomeMessageBgColor = VERY_LIGHT_BLUE;
export const welcomeMessageBorderColor = LIGHT_GRAY;

// 14px
export const brandFontSize = "14px";
export const headerLinkFontSize = "14px";
// 18px
export const blockHeaderFontSize = "18px";
// 25px
export const homePageHeadingFontSize = "25px";

// 600
export const brandFontWeight = 600;

export const blockBorderRadius = "3px";

export const blockBorderAndBoxShadow = css`
  border: 1px solid ${blockBorderColor};
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: ${blockBorderRadius};
  box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 1px 2px rgba(0,0,0,.05);
`;

export const blockHeaderCSS = css`
  background-color: ${blockHeaderBgColor};
  border-bottom: 1px solid ${blockBorderColor};
  border-radius: ${blockBorderRadius} ${blockBorderRadius} 0 0;
  color: #111;
  font-family: "Lato";
  font-size: ${blockHeaderFontSize};
  padding: 5px 10px;
`;

export const blockBodyCSS = css`
  background-color: ${blockBodyBgColor};
  border-radius: 0 0 ${blockBorderRadius} ${blockBorderRadius};
  padding: 10px;
`;
