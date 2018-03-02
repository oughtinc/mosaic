import * as React from "react";
import { Form, Field } from "react-final-form";

import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";

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
          initialValues[block.id] = block.value && block.value.text;
      }
      const onSubmit = async (values) => {
          let inputs: any = [];
          for (const key of Object.keys(values)) {
              inputs = [...inputs, {id: key, value: {text: values[key]}}];
          }
          const variables = {blocks: inputs};
          this.props.updateBlocks({
            variables,
          });
      };
      return (
        <div>
        <h1>🏁 React Final Form - Simple Example</h1>
        <Form
          onSubmit={onSubmit}
          initialValues={initialValues}
          render={({ handleSubmit, reset, submitting, pristine, values }) => (
            <form onSubmit={handleSubmit}>
            {workspace.blocks.map((b) => (
              <div>
                <label>{b.type}</label>
                <Field
                  name={b.id}
                  component="input"
                  type="text"
                  placeholder="Contents"
                />
              </div>
            ))}
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
              <pre>{JSON.stringify(values)}</pre>
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