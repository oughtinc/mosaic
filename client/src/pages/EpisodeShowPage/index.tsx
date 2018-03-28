import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { Row, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";

import { ChildrenSidebar } from "./ChildrenSidebar";
import { Link } from "react-router-dom";
import { addBlocks, saveBlocks } from "../../modules/blocks/actions";
import { BlockEditor } from "../../components/BlockEditor";
import { BlockHoverMenu } from "../../components/BlockHoverMenu";
import { PointerTable } from "./PointerTable";
import { exportingBlocksPointersSelector, exportingNodes } from "../../modules/blocks/exportingPointers";
import Plain from "slate-plain-serializer";
import * as _ from "lodash";
import { Value } from "slate";
import { WorkspaceRelationTypes, WorkspaceBlockRelation, WorkspaceWithRelations } from "./WorkspaceRelations";
import { BlockEditorStyle } from "../../components/BlockEditor/BlockEditorEditing";

const WORKSPACE_QUERY = gql`
    query workspace($id: String!){
        workspace(id: $id){
          id
          parentId
          childWorkspaceOrder
          connectedPointers
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

function findPointers(value: any) {
    const _value = value ? Value.fromJSON(value) : Plain.deserialize("");
    const pointers = exportingNodes(_value.document);
    return pointers;
}

export class FormPagePresentational extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
    }

    public updateBlocks = (blocks: any) => {
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

        let importedPointers = workspace.connectedPointers;
        const allReadOnlyBlocks = (new WorkspaceWithRelations(workspace)).allReadOnlyBlocks();
        const readOnlyExportedPointers = _.flatten(allReadOnlyBlocks.map((b) => findPointers(b.value)));
        const availablePointers = _.uniqBy([...this.props.exportingPointers, ...importedPointers, ...readOnlyExportedPointers], (p) => p.data.pointerId);
        return (
            <div key={workspace.id}>
                <BlockHoverMenu>
                    <Row>
                        <Col sm={12}>
                            {workspace.parentId &&
                                <ParentLink parentId={workspace.parentId} />
                            }
                            <h3>
                                <BlockEditor
                                    availablePointers={availablePointers}
                                    {...(new WorkspaceBlockRelation(WorkspaceRelationTypes.WorkspaceQuestion, workspace).blockEditorAttributes())}
                                />
                            </h3>
                            <div style={{marginBottom: "3em"}}/>
                        </Col>
                        <Col sm={12}>
                            <Row>
                                <Col sm={9}>
                                    <Row>
                                        <Col sm={12}>
                                            <h3>Private Information</h3>
                                            <div style={{padding: "11px", border: "1px solid #d2d2d2", borderRadius: "3px" }}>
                                                <h4>Scratchpad</h4>
                                                <BlockEditorStyle>
                                                    <BlockEditor
                                                        availablePointers={availablePointers}
                                                        {...(new WorkspaceBlockRelation(WorkspaceRelationTypes.WorkspaceScratchpad, workspace).blockEditorAttributes())}
                                                    />
                                                </BlockEditorStyle>
                                                <div style={{marginBottom: "3em"}}/>
                                                <ChildrenSidebar
                                                    workspaces={workspace.childWorkspaces}
                                                    availablePointers={availablePointers}
                                                    workspaceOrder={workspace.childWorkspaceOrder}
                                                    onCreateChild={(question) => { this.props.createChild({ variables: { workspaceId: workspace.id, question } }); }}
                                                    changeOrder={(newOrder) => { this.props.updateWorkspace({ variables: { id: workspace.id, childWorkspaceOrder: newOrder } }); }}
                                                />
                                            </div>
                                            <div style={{marginBottom: "3em"}}/>
                                            <h3>Answer</h3>
                                            <BlockEditorStyle>
                                                <BlockEditor
                                                    availablePointers={availablePointers}
                                                    {...(new WorkspaceBlockRelation(WorkspaceRelationTypes.WorkspaceAnswer, workspace).blockEditorAttributes())}
                                                />
                                            </BlockEditorStyle>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col sm={3}>
                                    <h3>Available Pointers</h3>
                                    <PointerTable
                                        availablePointers={availablePointers}
                                        exportingPointerIds={this.props.exportingPointers.map((p) => p.data.pointerId)}
                                    />
                                </Col>
                            </Row>
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

function visibleBlockIds(workspace: any) {
    if (!workspace) { return []; }
    const directBlockIds = workspace.blocks.map((b) => b.id);
    const childBlockIds = _.flatten(workspace.childWorkspaces.map((w) => w.blocks.filter((b) => b.type !== "SCRATCHPAD"))).map((b: any) => b.id);
    return [...directBlockIds, ...childBlockIds];
}

function mapStateToProps(state: any, { workspace }: any) {
    const _visibleBlockIds = visibleBlockIds(workspace.workspace);
    const exportingPointers = exportingBlocksPointersSelector(_visibleBlockIds)(state);
    const { blocks } = state;
    return { blocks, exportingPointers };
}

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
        mapStateToProps, { addBlocks, saveBlocks }
    )
)(FormPagePresentational);
