import * as React from "react";
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
import { addBlocks, saveBlocks } from "../../modules/blocks/actions";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { PointerTable } from "./PointerTable";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WORKSPACE_QUERY = gql`
    query workspace($id: String!){
        workspace(id: $id){
          id
          parentId
          childWorkspaceOrder
          pointerImports{
            id
            pointer {
                id
                value
            }
          }
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

const ParentLink = (props) => (
    <Link to={`/workspaces/${props.parentId}`}>
        <Button>To Parent</Button>
    </Link>
);

export class FormPagePresentational extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.updateBlocks = this.updateBlocks.bind(this);
    }

    public onSubmit() {
        const workspace = this.props.workspace.workspace;
    }

    public updateBlocks(blocks: any) {
        const variables = { blocks };
        this.props.updateBlocks({
            variables,
        });
    }

    public render() {
        const workspace = this.props.workspace.workspace;
        if (!workspace) {
            return <div> Loading </div>;
        }
        let initialValues = {};

        const question = workspace.blocks.find((b) => b.type === "QUESTION");
        const answer = workspace.blocks.find((b) => b.type === "ANSWER");
        const scratchpad = workspace.blocks.find((b) => b.type === "SCRATCHPAD");
        return (
            <div key={workspace.id}>
                <BlockHoverMenu>
                    <Row>
                        <Col sm={12}>
                            {workspace.parentId &&
                                <ParentLink parentId={workspace.parentId} />
                            }
                            <h1>
                                <BlockEditor
                                    name={question.id}
                                    blockId={question.id}
                                    initialValue={question.value}
                                    readOnly={true}
                                />
                            </h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={6}>
                            <h3>Scratchpad</h3>
                                <BlockEditor
                                    name={question.id}
                                    blockId={scratchpad.id}
                                    initialValue={scratchpad.value}
                                />
                            <h3>Answer</h3>
                                <BlockEditor
                                    name={answer.id}
                                    blockId={answer.id}
                                    initialValue={answer.value}
                                />
                            <Button onClick={() => { this.props.saveBlocks({ ids: [scratchpad.id, answer.id], updateBlocksFn: this.updateBlocks }); }}> Save </Button>
                        </Col>
                        <Col sm={3}>
                            <h3>Pointers</h3>
                            <PointerTable/>
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
                </BlockHoverMenu>
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
        ({ blocks }) => ({ blocks }), { addBlocks, saveBlocks }
    )
)(FormPagePresentational);
