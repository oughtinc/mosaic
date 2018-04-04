import gql from "graphql-tag";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";
import { Button, Col, Row, ProgressBar, Badge } from "react-bootstrap";
import styled from "styled-components";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { NewBlockForm } from "../../components/NewBlockForm";
import { databaseJSONToValue } from "../../lib/slateParser";
import * as React from "react";

const WorkspaceStyle = styled.div`
  border: 1px solid #ddd;
  padding: 3px;
  margin-bottom: 3px;
`;

const WORKSPACES_QUERY = gql`
    query OriginWorkspaces{
        workspaces(where:{parentId:null}){
          id
          parentId
          childWorkspaceOrder
          totalBudget 
          allocatedBudget 
          blocks{
              id
              value
              type
          }
        }
    }
 `;

const CREATE_ROOT_WORKSPACE = gql`
  mutation createWorkspace($question:JSON, $totalBudget: Int){
    createWorkspace(question:$question, totalBudget:$totalBudget ){
        id
        parentId
        childWorkspaceOrder
        totalBudget 
        allocatedBudget 
        blocks{
            id
            value
            type
        }
    }
  }
`;

const ParentWorkspace = ({ workspace }) => {
    const question = workspace.blocks && workspace.blocks.find((b) => b.type === "QUESTION");
    const answer = workspace.blocks && workspace.blocks.find((b) => b.type === "ANSWER");
    return (
        <WorkspaceStyle>
            <Row>
                <Col sm={4}>
                    {question && question.value &&
                        <BlockEditor
                            name={question.id}
                            blockId={question.id}
                            initialValue={databaseJSONToValue(question.value)}
                            readOnly={true}
                            availablePointers={[]}
                        />
                    }
                </Col>
                <Col sm={4}>
                    {answer && answer.value &&
                        <BlockEditor
                            name={answer.id}
                            blockId={answer.id}
                            initialValue={databaseJSONToValue(answer.value)}
                            readOnly={true}
                            availablePointers={[]}
                        />
                    }
                </Col>
                <Col sm={2}>
                    {workspace &&
                        <div style={{ float: "right" }}>
                            <Badge>{workspace.totalBudget - workspace.allocatedBudget} / {workspace.totalBudget}</Badge>
                        </div>
                    }
                </Col>
                <Col sm={1}>
                    {workspace &&
                        <ProgressBar now={100 * ((workspace.totalBudget - workspace.allocatedBudget) / workspace.totalBudget)} />
                    }
                </Col>
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
                <h3> New Root Workspace </h3>
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
        const workspaces = this.props.originWorkspaces.workspaces;
        return (
            <BlockHoverMenu>
                <h1> Root Workspaces </h1>
                {workspaces && workspaces.map((w) => (
                    <ParentWorkspace workspace={w} key={w.id} />
                ))}
                <NewWorkspaceForm
                    onCreateWorkspace={({ question, totalBudget }) => { this.props.createWorkspace({ variables: { question, totalBudget } }); }}
                />
            </BlockHoverMenu>
        );
    }
}

export const RootWorkspacePage = compose(
    graphql(WORKSPACES_QUERY, { name: "originWorkspaces" }),
    graphql(CREATE_ROOT_WORKSPACE, {
        name: "createWorkspace", options: {
            refetchQueries: [
                "OriginWorkspaces",
            ],
        },
    }),
)(RootWorkspacePagePresentational);
