import * as React from "react";
import { Form, Field } from "react-final-form";

import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { type, Node, Value } from 'slate';
import { Editor } from 'slate-react';
import Plain from 'slate-plain-serializer';
import { ChildrenSidebar } from "./ChildrenSidebar";
import { Row, Col } from "react-bootstrap";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WORKSPACE_QUERY = gql`
    query workspaces{
        workspaces{
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

export class ChildForm extends React.Component<any, any> {
  public render() {
    const onSubmit = async (values) => {
      this.props.onMutate(JSON.stringify(values['new'].toJSON()))
    }
    return (
      <Form
        onSubmit={onSubmit}
        initialValues={{ 'new':  Plain.deserialize("") }}
        render={({ handleSubmit, reset, submitting, pristine, values }) => (
          <div>
            <form onSubmit={handleSubmit}>
              <h3> New Child </h3>
              <Field
                name={'new'}
                render={({ input, meta }) => (
                  <div>
                    {meta.touched && meta.error && <span>{meta.error}</span>}
                    <Editor
                      value={input.value}
                      onChange={(c) => { input.onChange(c.value) }}
                    />
                  </div>
                )}
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
          </div>
        )}
      />
    )
  }
}

export class FormPagePresentational extends React.Component<any, any> {
  public render() {
    const workspace = this.props.workspaces.workspaces && this.props.workspaces.workspaces[0];
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
    const question = workspace.blocks.find(b => b.type === "QUESTION")
    const answer = workspace.blocks.find(b => b.type === "ANSWER")
    const scratchpad = workspace.blocks.find(b => b.type === "SCRATCHPAD")
    console.log(scratchpad)
    return (
      <div>
        <Row>
            <Col>

        <h1>
          <Editor
            value={Value.fromJSON(question.value)}
            onChange={() => { }}
          />
        </h1>
        <Form
          onSubmit={onSubmit}
          initialValues={initialValues}
          render={({ handleSubmit, reset, submitting, pristine, values }) => (
            <form onSubmit={handleSubmit}>

              <h3> Scratchpad </h3>
              <Field
                name={scratchpad.id}
                render={({ input, meta }) => (
                  <div>
                    {meta.touched && meta.error && <span>{meta.error}</span>}
                    <Editor
                      value={input.value}
                      onChange={(c) => { input.onChange(c.value) }}
                    />
                  </div>
                )}
              />

              <h3> Answer </h3>
              <Field
                name={answer.id}
                render={({ input, meta }) => (
                  <div>
                    {meta.touched && meta.error && <span>{meta.error}</span>}
                    <Editor
                      value={input.value}
                      onChange={(c) => { input.onChange(c.value) }}
                    />
                  </div>
                )}
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
        <ChildForm onMutate={(question) => {this.props.createChild({variables: {workspaceId: workspace.id, question}})}}/>
        <ChildrenSidebar workspaces={workspace.childWorkspaces}/>
            </Col>
        </Row>
      </div>
    );
  }
}

export const EpisodeShowPage = compose(
  graphql(WORKSPACE_QUERY, { name: "workspaces" }),
  graphql(UPDATE_BLOCKS, { name: "updateBlocks" }),
  graphql(NEW_CHILD, { name: "createChild", options: {
    refetchQueries:[
      'workspaces' 
    ]
  } })
)(FormPagePresentational);