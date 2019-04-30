import { css } from "styled-components";

export const WHITE = "#fff";
export const VERY_LIGHT_GRAY = "#f7f7f7";
export const LIGHT_GRAY = "#ddd";
export const GRAY = "#bbb";
export const SLIGHTLY_DARKER_GRAY = "#999";
export const DARK_GRAY = "#666";
export const VERY_DARK_GRAY = "#333";
export const VERY_LIGHT_BLUE = "#f0f8ff";
export const DARK_BLUE = "#337ab7";
export const VERY_DARK_BLUE = "#26a";
export const LIVELY_BLUE = "#007deb";
export const DARKENED_LIVELY_BLUE = "#0062b8";

export const adminCheckboxBgColor = VERY_LIGHT_GRAY;
export const adminCheckboxBorderColor = GRAY;
export const availableBudgetHeaderFontColor = DARK_BLUE;
export const charCountDisplayHeaderFontColor = DARK_BLUE;
export const depthDisplayHeaderFontColor = DARK_BLUE;
export const blockBodyBgColor = WHITE;
export const blockBorderColor = LIGHT_GRAY;
export const blockHeaderBgColor = VERY_LIGHT_GRAY;
export const blockBulletBgColor = WHITE;
export const blockBulletFontColor = GRAY;
export const blockBulletBgColorOnHover = VERY_LIGHT_GRAY;
export const blockBulletFontColorOnHover = SLIGHTLY_DARKER_GRAY;
export const editBudgetFormBoxShadow = `0 0 3px ${DARK_GRAY}`;
export const headerBgColor = DARK_BLUE;
export const newQuestionFormFooterBgColor = VERY_LIGHT_GRAY;
export const newQuestionFormBorderTopColor = LIGHT_GRAY;
export const lockedPointerImportBgColor = DARK_BLUE;
export const lockedPointerImportBgColorOnHover = VERY_DARK_BLUE;
export const responseFooterBgColor = VERY_LIGHT_GRAY;
export const responseFooterBorderTopColor = LIGHT_GRAY;
export const subquestionsFooterBgColor = VERY_LIGHT_GRAY;
export const subquestionsFooterBorderTopColor = LIGHT_GRAY;
export const timerHeaderFontColor = DARK_BLUE;
export const treeBulletBgColor = WHITE;
export const treeBulletBgColorOnHover = VERY_LIGHT_GRAY;
export const treeBulletArrowColor = GRAY;
export const treeBulletArrowColorWhenActive = SLIGHTLY_DARKER_GRAY;
export const treeWorkspaceBgColor = WHITE;
export const brandFontColor = WHITE;
export const headerLinkFontColor = WHITE;
export const subQuestionAnswerFontColor = VERY_DARK_GRAY;
export const unlockedImportBgColor = LIVELY_BLUE;
export const unlockedImportBgColorOnHover = DARKENED_LIVELY_BLUE;

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
export const timerHeaderFontSize = "18px";
export const availableBudgetHeaderFontSize = "18px";
export const charCountDisplayHeaderFontSize = "18px";
export const depthDisplayHeaderFontSize = "18px";
// 25px
export const homePageHeadingFontSize = "25px";
// 28px
export const workspaceViewQuestionFontSize = "28px";

// 600
export const brandFontWeight = 600;

export const blockBorderRadius = "3px";

export const blockBorderAndBoxShadow = css`
  border: 1px solid ${blockBorderColor};
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: ${blockBorderRadius};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 1px 2px rgba(0, 0, 0, 0.05);
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
