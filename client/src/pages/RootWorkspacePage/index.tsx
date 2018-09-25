import * as _ from "lodash";
import * as React from "react";
import styled from "styled-components";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";
import { Alert, Button } from "react-bootstrap";

import { BlockEditor } from "../../components/BlockEditor";
import { NewBlockForm } from "../../components/NewBlockForm";
import { databaseJSONToValue } from "../../lib/slateParser";
import { CREATE_ROOT_WORKSPACE, WORKSPACES_QUERY, TOGGLE_WORKSPACE_ELIGIBILITY } from "../../graphqlQueries";
import { Auth } from "../../auth";

import "./RootWorkspacePage.css";

const RootWorkspacePageSection = styled.div`
  margin-top: 35px;
  margin-bottom: 50px;
`;

const RootWorkspacePageHeading = styled.h2`
  font-size: 25px;
`;

const WorkspaceList = styled.div`

`;

const WorkspaceStyle = styled.div`
  background-color: #fff;
  padding: 10px;
  margin: 5px 0;

  border-radius: 3px;
  border: 1px solid #ddd;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 1px 2px rgba(0,0,0,.05);
`;

const TextBlock = styled.div`
  display: inline-block;
`;

const TreeButton = styled(Button)`
  margin: 5px 1px;
`;

const Description = styled.div`
  display: block;
  color: #bbb;
`;

const workspaceToBlock = (workspace: any, blockType: string) =>
  workspace.blocks && workspace.blocks.find(b => b.type === blockType);

const RootBlock = ({ availablePointers = [], block }) =>
  block &&
  block.value && (
    <TextBlock>
      <BlockEditor
        name={block.id}
        blockId={block.id}
        initialValue={databaseJSONToValue(block.value)}
        readOnly={true}
        shouldAutosave={false}
        availablePointers={availablePointers}
      />
    </TextBlock>
  );

const RootWorkspace = ({ workspace, toggleWorkspaceEligibility }) => {
  const question = workspaceToBlock(workspace, "QUESTION");
  const answer = workspaceToBlock(workspace, "ANSWER");
  const scratchpad = workspaceToBlock(workspace, "SCRATCHPAD");
  return (
    <WorkspaceStyle>
      {
        Auth.isAdmin()
        &&
        <input
          style={{
            marginRight: "10px",
          }}
          type="checkbox"
          defaultChecked={workspace.isEligibleForAssignment}
          onChange={() => toggleWorkspaceEligibility({ variables: { workspaceId: workspace.id }})}
        />
      }
      <Link to={`/workspaces/${workspace.id}`}>
        <RootBlock block={question} />
      </Link>
      {" "}
      <RootBlock block={answer} availablePointers={workspace.connectedPointers} />
      <Link to={`/workspaces/${workspace.id}/subtree`}>
        <TreeButton bsSize="xsmall" bsStyle="default" className="pull-right">Tree »</TreeButton>
      </Link>
      <Description>
        <RootBlock block={scratchpad} availablePointers={workspace.connectedPointers} />
      </Description>
      <div style={{ clear: "both" }} />
    </WorkspaceStyle>
  );
};

class NewWorkspaceForm extends React.Component<any, any> {
  public render() {
    return (
      <div>
        <NewBlockForm
          maxTotalBudget={10000}
          onMutate={this.props.onCreateWorkspace}
        />
      </div>
    );
  }
}

const AuthMessage = () => {
  return (
    <Alert className="AuthMessage">
      <p>
        <strong>Welcome!</strong> Mosaic is an app for recursive
        question-answering with pointers. You can browse public question-answer
        trees below or create private ones by signing up.
      </p>
      <p>
        This is an alpha version with bugs, missing features, and usability
        issues. You can check out{" "}
        <a href="https://github.com/oughtinc/mosaic">the code</a> and{" "}
        <a href="https://ought.org/projects/factored-cognition">
          learn more about the project
        </a>.
      </p>
    </Alert>
  );
};

export class RootWorkspacePagePresentational extends React.Component<any, any> {
  public render() {
    const isLoading = this.props.originWorkspaces.loading;

    const workspaces = _.sortBy(
      this.props.originWorkspaces.workspaces,
      workspace => Date.parse(workspace.createdAt)
    );

    return (
      <div>
        {!Auth.isAuthenticated() && <AuthMessage />}
        <RootWorkspacePageSection>
          <RootWorkspacePageHeading>Questions</RootWorkspacePageHeading>
          <WorkspaceList>
            {isLoading
              ? "Loading..."
              : workspaces.map(w => <RootWorkspace toggleWorkspaceEligibility={this.props.toggleWorkspaceEligibility} workspace={w} key={w.id} />)}
          </WorkspaceList>
        </RootWorkspacePageSection>
        {Auth.isAuthenticated() && (
          <RootWorkspacePageSection>
            <NewWorkspaceForm
              onCreateWorkspace={({ question, totalBudget }) => {
                this.props.createWorkspace({
                  variables: { question, totalBudget }
                });
              }}
            />
          </RootWorkspacePageSection>
        )}
      </div>
    );
  }
}

export const RootWorkspacePage = compose(
  graphql(WORKSPACES_QUERY, { name: "originWorkspaces" }),
  graphql(CREATE_ROOT_WORKSPACE, {
    name: "createWorkspace",
    options: {
      refetchQueries: ["OriginWorkspaces"]
    }
  }),
  graphql(TOGGLE_WORKSPACE_ELIGIBILITY, {
    name: "toggleWorkspaceEligibility",
    options: {
      refetchQueries: ["OriginWorkspaces"]
    }
  })
)(RootWorkspacePagePresentational);
