import * as React from "react";
import { Form, Field } from "react-final-form";

import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { type, Node, Value } from 'slate';
import { Editor } from 'slate-react';
import Plain from 'slate-plain-serializer';



const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WORKSPACE_QUERY = gql`
    query{
        workspaces{
        id
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

export class FormPagePresentational extends React.Component<any, any> {
  public render() {
      const props: any = this.props;
      const workspace = props.workspaces.workspaces && props.workspaces.workspaces[0];
      if (!workspace) {
          return <div> Loading </div>;
      }
      console.log(workspace);
      let initialValues = {};
      for (const block of workspace.blocks) {
          initialValues[block.id] = block.value && Value.fromJSON(block.value);
      }
      const onSubmit = async (values) => {
          let inputs: any = [];
          for (const key of Object.keys(values)) {
              inputs = [...inputs, {id: key, value: JSON.stringify(values[key].toJSON())}];
          }
          const variables = {blocks: inputs};
          console.log(variables)
          this.props.updateBlocks({
            variables,
          });
      };
      const question = workspace.blocks.find(b => b.type === "QUESTION")
      const answer = workspace.blocks.find(b => b.type === "ANSWER")
      const scratchpad = workspace.blocks.find(b => b.type === "SCRATCHPAD")
      console.log(question)
      return (
        <div>
        <h1>
          <Editor
          value={Value.fromJSON(question.value)}
          onChange={() => {}}
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
                      onChange={(c) => {input.onChange(c.value)}}
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
                      onChange={(c) => {input.onChange(c.value)}}
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
        </div>
    );
  }
}

export const FormPage = compose(
  graphql(WORKSPACE_QUERY, { name: "workspaces" }),
  graphql(UPDATE_BLOCKS, { name: "updateBlocks" })
)(FormPagePresentational);