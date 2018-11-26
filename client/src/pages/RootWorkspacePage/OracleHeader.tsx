import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button, Checkbox } from "react-bootstrap";
import { compose } from "recompose";
import styled from "styled-components";

import { ContentContainer } from "../../components/ContentContainer";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,
  homepageWorkspaceBgColor,
  homepageWorkspaceScratchpadFontColor,
  blockBorderAndBoxShadow
} from "../../styles";

const ORACLE_MODE_QUERY = gql`
  query oracleModeQuery {
    oracleMode
  }
`;

const UPDATE_ORACLE_MODE = gql`
  mutation updateOracleMode($oracleMode: Boolean) {
    updateOracleMode(oracleMode: $oracleMode)
  }
`;

class OracleHeaderPresentational extends React.Component<any, any> {
  public render() {
    console.log("oracle header props", this.props);
    return (
      <ContentContainer>
      { this.props.oracleModeQuery.oracleMode ? "Oracle Mode ON" : "Oracle Mode OFF" }
      <Button
        onClick={() => {
          this.props.updateOracleMode({
            variables: {
              oracleMode: !this.props.oracleModeQuery.oracleMode,
            }
          });
        }}
      >
        Toggle Oracle Mode
      </Button>
      </ContentContainer>
    );
  }
}

const OracleHeader: any = compose(
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  }),
  graphql(UPDATE_ORACLE_MODE, {
    name: "updateOracleMode",
    options: {
      refetchQueries: ["oracleModeQuery"]
    }
  }),
)(OracleHeaderPresentational);

export { OracleHeader };
