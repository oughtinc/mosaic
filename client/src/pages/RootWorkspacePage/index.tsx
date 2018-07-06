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
import { CREATE_ROOT_WORKSPACE, WORKSPACES_QUERY } from "../../graphqlQueries";
import { Auth } from "../../auth";

const RootWorkspacePageSection = styled.div`
  margin-top: 35px;
  margin-bottom: 50px;
`;

const RootWorkspacePageHeading = styled.h2`
  font-size: 25px;
`;

const WorkspaceList = styled.div`
  background-color: #f6f8fa;
  padding: 1px;
  border: 1px solid #ddd;
`;

const WorkspaceStyle = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 1px 4px;
  margin: 3px;
`;

const TextBlock = styled.div`
  display: inline-block;
`;

const TreeButton = styled(Button)`
  padding: 1px 4px;
  margin: 2px 0;
`;

const Description = styled.div`
  display: block;
  color: #bbb;
`;

const workspaceToBlock = (workspace: any, blockType: string) =>
  workspace.blocks && workspace.blocks.find(b => b.type === blockType);

const RootBlock = ({ block }) =>
  block &&
  block.value && (
    <TextBlock>
      <BlockEditor
        name={block.id}
        blockId={block.id}
        initialValue={databaseJSONToValue(block.value)}
        readOnly={true}
        shouldAutosave={false}
        availablePointers={[]}
      />
    </TextBlock>
  );

const RootWorkspace = ({ workspace }) => {
  const question = workspaceToBlock(workspace, "QUESTION");
  const answer = workspaceToBlock(workspace, "ANSWER");
  const scratchpad = workspaceToBlock(workspace, "SCRATCHPAD");
  return (
    <WorkspaceStyle>
      <Link to={`/workspaces/${workspace.id}`}>
        <RootBlock block={question} />
      </Link>
      <RootBlock block={answer} />
      <Link to={`/workspaces/${workspace.id}/subtree`}>
        <TreeButton className="pull-right">Tree</TreeButton>
      </Link>
      <Description>
        <RootBlock block={scratchpad} />
      </Description>
    </WorkspaceStyle>
  );
};

class NewWorkspaceForm extends React.Component<any, any> {
  public render() {
    return (
      <div>
        <RootWorkspacePageHeading>
          {Auth.isAdmin() ? "New Question (public)" : "New Question (unlisted)"}
        </RootWorkspacePageHeading>
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
    <Alert>
      <p>
        <strong>Welcome!</strong> Try browsing public question-answer trees or create your own by signing up.
      </p>
    </Alert>
  );
};

export class RootWorkspacePagePresentational extends React.Component<any, any> {
  public render() {
    const isLoading = this.props.originWorkspaces.loading;
    const workspaces = _.sortBy(
      this.props.originWorkspaces.workspaces,
      "createdAt"
    );
    return (
      <div>
        {!Auth.isAuthenticated() && <AuthMessage />}
        <RootWorkspacePageSection>
          <RootWorkspacePageHeading>Questions</RootWorkspacePageHeading>
          <WorkspaceList>
            {isLoading
              ? "Loading..."
              : workspaces.map(w => <RootWorkspace workspace={w} key={w.id} />)}
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
  })
)(RootWorkspacePagePresentational);
