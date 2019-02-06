import gql from "graphql-tag";
import * as _ from "lodash";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { HomePageHeading } from "./HomePageHeading";
import { ListOfRootWorkspaces } from "./ListOfRootWorkspaces";
import { NewExperimentForm } from "../../components/NewExperimentForm";
import { NewRootWorkspaceForm } from "./NewRootWorkspaceForm";
import { ListOfExperiments } from "./ExperimentsControls";
import { WelcomeMessage } from "./WelcomeMessage";
import { GetStartedNav } from "./GetStartedNav";
import { OracleHeader } from "./OracleHeader";

import { ContentContainer } from "../../components/ContentContainer";

import { Auth } from "../../auth";
import { CREATE_ROOT_WORKSPACE, WORKSPACES_QUERY } from "../../graphqlQueries";

export class RootWorkspacePagePresentational extends React.Component<any, any> {
  public render() {
    const isLoading = this.props.rootWorkspacesQuery.loading;

    const workspaces = _.sortBy(
      this.props.rootWorkspacesQuery.workspaces,
      workspace => Date.parse(workspace.createdAt)
    );

    return (
      <div>
        {Auth.isAuthenticated() && <GetStartedNav isInOracleMode={this.props.oracleModeQuery.oracleMode}/>}
        {Auth.isOracle() &&
          <OracleHeader />
        }
        <ContentContainer>
          {!Auth.isAuthenticated() && <WelcomeMessage />}
          
          <ListOfRootWorkspaces isLoading={isLoading} workspaces={workspaces} />
          {Auth.isAuthenticated() && (
            <NewRootWorkspaceForm
              createWorkspace={this.props.createWorkspace}
              style={{
                marginBottom: "30px",
                marginTop: "30px"
              }}
            />
          )}
          {
            Auth.isAdmin() 
            && 
            <div>
              <HomePageHeading>Experiments</HomePageHeading>
              <ListOfExperiments />
            </div>
          }
          {Auth.isAdmin() && <NewExperimentForm />}
        </ContentContainer>
      </div>
    );
  }
}

const ORACLE_MODE_QUERY = gql`
  query oracleModeQuery {
    oracleMode
  }
`;

export const RootWorkspacePage = compose(
  graphql(WORKSPACES_QUERY, { name: "rootWorkspacesQuery" }),
  graphql(CREATE_ROOT_WORKSPACE, {
    name: "createWorkspace",
    options: {
      refetchQueries: ["RootWorkspacesQuery"]
    }
  }),
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  }),
)(RootWorkspacePagePresentational);
