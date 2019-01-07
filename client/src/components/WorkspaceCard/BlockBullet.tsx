import styled from "styled-components";
import { Link } from "react-router-dom";

import {
  blockBulletBgColor,
  blockBulletFontColor,
  blockBulletBgColorOnHover,
  blockBulletFontColorOnHover
} from "../../styles";

// Should potentially be able to eliminate some of the style sharing below with withComponent, but wasn't able to find a clean solution.
export const BlockBullet = styled.div`
  border-radius: 2px;
  color: ${blockBulletFontColor};
  padding: 0px 4px;
  margin: 0px 4px 4px 0px;
  font-weight: 500;
  flex: 0;
`;

export const BlockBulletLink = styled(Link)`
  background-color: ${blockBulletBgColor};
  border-radius: 2px;
  color: ${blockBulletFontColor};
  padding: 0px 4px;
  margin: 4px 4px 4px 9px;
  font-weight: 500;
  flex: 0;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: ${blockBulletFontColorOnHover};
    text-decoration: none;
  }
`;
