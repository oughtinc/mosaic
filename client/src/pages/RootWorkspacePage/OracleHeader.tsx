import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Alert, Button } from "react-bootstrap";
import { compose } from "recompose";

import { ContentContainer } from "../../components/ContentContainer";

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
    return (
      <ContentContainer>
        <Alert
          bsStyle="danger"
          style={{ marginBottom: 0 }}
        >
          You are currently logged on as an oracle.
          <br />
          <br />
          Oracle mode is currently
          {this.props.oracleModeQuery.oracleMode ? " ON" : " OFF"}.
          <br />
          <br />
          <Button
            onClick={() => {
              this.props.updateOracleMode({
                variables: {
                  oracleMode: !this.props.oracleModeQuery.oracleMode,
                }
              });
            }}
          >
            Toggle Oracle Mode {!this.props.oracleModeQuery.oracleMode ? "ON" : "OFF"}
          </Button>
        </Alert>
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
