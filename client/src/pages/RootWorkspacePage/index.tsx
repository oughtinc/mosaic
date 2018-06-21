import * as _ from "lodash";
import * as React from "react";

import { compose } from "recompose";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import styled from "styled-components";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { NewBlockForm } from "../../components/NewBlockForm";
import { databaseJSONToValue } from "../../lib/slateParser";
import { CREATE_ROOT_WORKSPACE, WORKSPACES_QUERY } from "../../graphqlQueries";
import { Auth } from "../../auth";

const WorkspaceStyle = styled.div`
  border: 1px solid #ddd;
  padding: 3px;
  margin-bottom: 3px;
`;

const ParentWorkspace = ({ workspace }) => {
  const question =
    workspace.blocks && workspace.blocks.find(b => b.type === "QUESTION");
  const answer =
    workspace.blocks && workspace.blocks.find(b => b.type === "ANSWER");
  return (
    <WorkspaceStyle>
      <Row>
        <Col sm={4}>
          {question &&
            question.value && (
              <BlockEditor
                name={question.id}
                blockId={question.id}
                initialValue={databaseJSONToValue(question.value)}
                readOnly={true}
                availablePointers={[]}
              />
            )}
        </Col>
        <Col sm={4}>
          {answer &&
            answer.value && (
              <BlockEditor
                name={answer.id}
                blockId={answer.id}
                initialValue={databaseJSONToValue(answer.value)}
                readOnly={true}
                availablePointers={[]}
              />
            )}
        </Col>
        <Col sm={3} />
        <Col sm={1}>
          <Link to={`/workspaces/${workspace.id}`}>
            <Button> Open </Button>
          </Link>
        </Col>
      </Row>
    </WorkspaceStyle>
  );
};

class NewWorkspaceForm extends React.Component<any, any> {
  public render() {
    return (
      <div>
        <h3>
          {Auth.isAdmin() ? "New Public Workspace" : "New Personal Workspace"}
        </h3>
        <NewBlockForm
          maxTotalBudget={10000}
          onMutate={this.props.onCreateWorkspace}
        />
      </div>
    );
  }
}

export class RootWorkspacePagePresentational extends React.Component<any, any> {
  public render() {
    const workspaces = _.sortBy(
      this.props.originWorkspaces.workspaces,
      "createdAt"
    );
    const isAuthenticated = Auth.isAuthenticated();
    const authButton = {
      label: isAuthenticated ? "Log out" : "Log in",
      action: () => {
        isAuthenticated ? Auth.logout() : Auth.login();
      }
    };
    return (
      <BlockHoverMenu>
        <Button
          bsStyle="primary"
          className="btn-margin"
          onClick={() => {
            authButton.action();
            this.forceUpdate();
          }}
        >
          {authButton.label}
        </Button>

        <h1> Public Workspaces </h1>
        {workspaces &&
          workspaces.map(w => <ParentWorkspace workspace={w} key={w.id} />)}
        {Auth.isAdmin() && (
          <NewWorkspaceForm
            onCreateWorkspace={({ question, totalBudget }) => {
              this.props.createWorkspace({
                variables: { question, totalBudget }
              });
            }}
          />
        )}
      </BlockHoverMenu>
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
  })
)(RootWorkspacePagePresentational);
