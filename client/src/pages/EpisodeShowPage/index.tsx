import * as React from "react";
import { Form, Field } from "react-final-form";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { type, Node, Value } from "slate";
import { Editor } from "slate-react";
import Plain from "slate-plain-serializer";
import { Row, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";

import { ChildrenSidebar } from "./ChildrenSidebar";
import { Link } from "react-router-dom";
import { Block } from "./Block";
import { addBlocks } from "../../modules/blocks/actions";
import { BlockEditor } from "../../components/BlockEditor";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WORKSPACE_QUERY = gql`
    query workspace($id: String!){
        workspace(id: $id){
          id
          parentId
          childWorkspaceOrder
          childWorkspaces{
            id
            blocks{
              id
              value
              type
            }
          }
          blocks{
              id
              value
              type
          }
        }
    }
 `;

const UPDATE_BLOCKS = gql`
    mutation updateBlocks($blocks:[blockInput]){
        updateBlocks(blocks:$blocks){
            id
            value
            updatedAtEventId
        }
    }
`;

const UPDATE_WORKSPACE = gql`
    mutation updateWorkspace($id: String!, $childWorkspaceOrder: [String]){
        updateWorkspace(id: $id, childWorkspaceOrder: $childWorkspaceOrder){
            id
        }
    }
`;

const NEW_CHILD = gql`
  mutation createChildWorkspace($workspaceId:String, $question:JSON){
    createChildWorkspace(workspaceId:$workspaceId, question:$question ){
        id
    }
  }
`;

export class FormPagePresentational extends React.Component<any, any> {
    public render() {
        const workspace = this.props.workspace.workspace;
        if (!workspace) {
            return <div> Loading </div>;
        }
        let initialValues = {};

        let allBlocks = [...workspace.blocks];
        workspace.childWorkspaces.map((c) => {
            allBlocks = [...allBlocks, ...c.blocks];
        });
        this.props.addBlocks(allBlocks);
        const onSubmit = async (values) => {
            let inputs: any = [];
            for (const key of Object.keys(values)) {
                inputs = [...inputs, { id: key, value: JSON.stringify(values[key].toJSON()) }];
            }
            const variables = { blocks: inputs };
            this.props.updateBlocks({
                variables,
            });
        };
        const question = workspace.blocks.find((b) => b.type === "QUESTION");
        const answer = workspace.blocks.find((b) => b.type === "ANSWER");
        const scratchpad = workspace.blocks.find((b) => b.type === "SCRATCHPAD");
        return (
            <div>
                <Row>
                    <Col sm={12}>
                        <h1>
                            <BlockEditor
                                isInField={true}
                                blockId={question.id}
                            />
                            {workspace.parentId &&
                                <Link to={`/workspaces/${workspace.parentId}`}>
                                    <Button> To Parent </Button>
                                </Link>
                            }
                        </h1>
                    </Col>
                </Row>
                <Row>
                    <Col sm={9}>
                        <BlockEditor
                            isInField={true}
                            blockId={scratchpad.id}
                        />
                        <BlockEditor
                            isInField={true}
                            blockId={answer.id}
                        />

                    </Col>
                    <Col sm={3}>
                        <ChildrenSidebar
                            workspaces={workspace.childWorkspaces}
                            workspaceOrder={workspace.childWorkspaceOrder}
                            onCreateChild={(question) => { this.props.createChild({ variables: { workspaceId: workspace.id, question } }); }}
                            changeOrder={(newOrder) => { this.props.updateWorkspace({ variables: { id: workspace.id, childWorkspaceOrder: newOrder } }); }}
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}

const options: any = ({ match }) => ({
    variables: { id: match.params.workspaceId },
});

export const EpisodeShowPage = compose(
    graphql(WORKSPACE_QUERY, { name: "workspace", options }),
    graphql(UPDATE_BLOCKS, { name: "updateBlocks" }),
    graphql(UPDATE_WORKSPACE, {
        name: "updateWorkspace", options: {
            refetchQueries: [
                "workspace",
            ],
        },
    }),
    graphql(NEW_CHILD, {
        name: "createChild", options: {
            refetchQueries: [
                "workspace",
            ],
        },
    }),
    connect(
        (state) => ({}), { addBlocks }
    )
)(FormPagePresentational);