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
import { Block } from "./Block";
import { addBlocks, saveBlocks } from "../../modules/blocks/actions";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";

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

const ParentLink = (props) => <Link to={`/workspaces/${props.parentId}`}>
    <Button>To Parent</Button>
  </Link>;

export class FormPagePresentational extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
    this.updateBlocks = this.updateBlocks.bind(this);
  }

    public componentWillUpdate(nextProps) {
        const nextWorkspace = nextProps.workspace.workspace;
        if (!this.props.workspace.workspace && !!nextWorkspace) {
            let allBlocks = [...nextWorkspace.blocks];
            nextWorkspace.childWorkspaces.map((c) => {
                allBlocks = [...allBlocks, ...c.blocks];
            });
            this.props.addBlocks(allBlocks);
        }
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

        const onSubmit = async (values) => {
            let inputs: any = [];
            for (const key of Object.keys(values)) {
                inputs = [...inputs, { id: key, value: JSON.stringify(values[key].toJSON()) }];
            }
        };
        const question = workspace.blocks.find((b) => b.type === "QUESTION");
        const answer = workspace.blocks.find((b) => b.type === "ANSWER");
        const scratchpad = workspace.blocks.find((b) => b.type === "SCRATCHPAD");
        return (
          <div>
            <BlockHoverMenu>
              <Row>
                <Col sm={12}>
                  {workspace.parentId &&
                   <ParentLink parentId={workspace.parentId}/>
                  }                    
                  <h1>
                    <BlockEditor
                      isInField={true}
                      blockId={question.id}
                      readOnly={true}
                    />                            
                  </h1>
                </Col>
              </Row>
              <Row>
                <Col sm={9}>
                  <h3>Scratchpad</h3>
                  <BlockEditor
                    isInField={true}
                    blockId={scratchpad.id}
                  />
                  <h3>Question</h3>
                  <BlockEditor
                    isInField={true}
                    blockId={answer.id}
                  />
                  <Button onClick={() => {this.props.saveBlocks({ids: [scratchpad.id, answer.id], updateBlocksFn: this.updateBlocks }); }}> Save </Button>
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
        ({blocks}) => ({blocks}), { addBlocks, saveBlocks }
    )
)(FormPagePresentational);
