import gql from "graphql-tag";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import styled from "styled-components";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { NewBlockForm } from "../../components/NewBlockForm";
import { databaseJSONToValue } from "../../lib/slateParser";
import * as React from "react";
import _ = require("lodash");

const WORKSPACES_QUERY = gql`
query workspaceSubtree($workspaceId: String!){
    subtreeWorkspaces(workspaceId:$workspaceId){
       id
       childWorkspaceOrder
       connectedPointers
       blocks{
         id
         value
         type
       }
     }
  }
`;

const ChildArea = styled.div`
`;

const ChildStyle = styled.div`
    margin-bottom: 1em;
    width: 100%;
`;

const Bullet = styled.div`
    margin-left: .3em;
    margin-bottom: 1em;
    font-size:4em;
`;

export class Child extends React.Component<any, any> {
    public render() {
        const { workspace, availablePointers, workspaces } = this.props;
        const question = workspace.blocks.find((b) => b.type === "QUESTION");
        const answer = workspace.blocks.find((b) => b.type === "ANSWER");
        const children = workspace.childWorkspaceOrder.map((id) => workspaces.find((w) => w.id === id));
        return (
            <ChildArea>
                <ChildStyle>
                    {question.value &&
                        < BlockEditor
                            name={question.id}
                            blockId={question.id}
                            readOnly={true}
                            initialValue={databaseJSONToValue(question.value)}
                            shouldAutosave={false}
                            availablePointers={this.props.availablePointers}
                        />
                    }

                    {answer.value &&
                        < BlockEditor
                            name={answer.id}
                            blockId={answer.id}
                            readOnly={true}
                            initialValue={databaseJSONToValue(answer.value)}
                            shouldAutosave={false}
                            availablePointers={this.props.availablePointers}
                        />
                    }

                    <Link to={`/workspaces/${workspace.id}`}>
                        <Button> Open </Button>
                    </Link>
                </ChildStyle>
                {!!children.length &&
                    <div>
                        <div style={{ float: "left", width: "60px" }}>
                            <Bullet>-</Bullet>
                        </div>
                        <div style={{ float: "left", width: "calc(100% - 60px)" }}>
                            {children.map((child) => (
                                <Child key={child.id} workspace={child} availablePointers={availablePointers} workspaces={workspaces} />
                            ))}
                        </div>
                    </div>
                }
            </ChildArea>
        );
    }
}

export class WorkspaceSubtreePagePresentational extends React.Component<any, any> {
    public render() {
        const workspaces = _.get(this.props, "workspaceSubtreeWorkspaces.subtreeWorkspaces") || [];
        const availablePointers = _.flatten(workspaces.map((w) => w.connectedPointers));
        const rootWorkspace = workspaces.find((w) => w.id === this.props.match.params.workspaceId);
        return (
            <div>
                <BlockHoverMenu>
                    {rootWorkspace &&
                        <Child workspace={rootWorkspace} availablePointers={availablePointers} workspaces={workspaces} />
                    }
                </BlockHoverMenu>
            </div>
        );
    }
}

const options: any = ({ match }) => ({
    variables: { workspaceId: match.params.workspaceId },
});

export const WorkspaceSubtreePage = compose(
    graphql(WORKSPACES_QUERY, { name: "workspaceSubtreeWorkspaces", options }),
)(WorkspaceSubtreePagePresentational);
