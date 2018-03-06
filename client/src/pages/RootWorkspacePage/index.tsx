import gql from "graphql-tag";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import React = require("react");
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import styled from "styled-components";

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
          blocks{
              id
              value
              type
          }
        }
    }
 `;

const ParentWorkspace = ({workspace}) => {
    const question = workspace.blocks && workspace.blocks.find((b) => b.type === "QUESTION");
    return (
    <WorkspaceStyle>
        {question && JSON.stringify(question.value)}
        <Link to={`/workspaces/${workspace.id}`}>
            <Button> Open </Button>
        </Link>
    </WorkspaceStyle>
    );
};

export class RootWorkspacePagePresentational extends React.Component<any, any> {
    public render() {
        const workspaces = this.props.workspaces.workspaces;
        return (
            <div>
                <h1> Root Workspaces </h1>
                {workspaces && workspaces.map((w) => (
                    <ParentWorkspace workspace={w} key={w.id}/>
                ))}
            </div>
        );
    }
}
export const RootWorkspacePage = compose(
    graphql(WORKSPACES_QUERY, {name: "workspaces" }),
 )(RootWorkspacePagePresentational);