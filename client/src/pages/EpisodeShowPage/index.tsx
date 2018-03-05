import * as React from "react";
import { Form, Field } from "react-final-form";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { type, Node, Value } from "slate";
import { Editor } from "slate-react";
import Plain from "slate-plain-serializer";
import { Row, Col } from "react-bootstrap";

import { ChildrenSidebar } from "./ChildrenSidebar";
import { BlockEditor } from "./BlockEditor";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WORKSPACE_QUERY = gql`
    query workspace($id: String!){
        workspace(id: $id){
          id
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

const NEW_CHILD = gql`
  mutation createChildWorkspace($workspaceId:String, $question:JSON){
    createChildWorkspace(workspaceId:$workspaceId, question:$question ){
        id
    }
  }
`;

export class FormPagePresentational extends React.Component<any, any> {
    public render() {
        console.log("GOT WORKSPACE", this.props);
        const workspace = this.props.workspace.workspace;
        if (!workspace) {
            return <div> Loading </div>;
        }
        let initialValues = {};
        for (const block of workspace.blocks) {
            initialValues[block.id] = block.value ? Value.fromJSON(block.value) : Plain.deserialize("");
        }
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
                                isInField={false}
                                value={!!question.value ? Value.fromJSON(question.value) : Plain.deserialize("")}
                            />
                        </h1>
                    </Col>
                </Row>
                <Row>
                    <Col sm={9}>
                        <Form
                            onSubmit={onSubmit}
                            initialValues={initialValues}
                            render={({ handleSubmit, reset, submitting, pristine, values }) => (
                                <form onSubmit={handleSubmit}>

                                    <h3> Scratchpad </h3>
                                    <BlockEditor
                                        isInField={true}
                                        name={scratchpad.id}
                                    />
                                    <h3> Answer </h3>
                                    <BlockEditor
                                        isInField={true}
                                        name={answer.id}
                                    />
                                    <div className="buttons">
                                        <button type="submit" disabled={submitting || pristine}>
                                            Submit
                                    </button>
                                        <button
                                            type="button"
                                            onClick={reset}
                                            disabled={submitting || pristine}>
                                            Reset
                                        </button>
                                    </div>
                                </form>
                            )}
                        />
                    </Col>
                    <Col sm={3}>
                        <ChildrenSidebar
                            workspaces={workspace.childWorkspaces}
                            onCreateChild={(question) => { this.props.createChild({ variables: { workspaceId: workspace.id, question } }); }}
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
    graphql(NEW_CHILD, {
        name: "createChild", options: {
            refetchQueries: [
                "workspace",
            ],
        },
    })
)(FormPagePresentational);