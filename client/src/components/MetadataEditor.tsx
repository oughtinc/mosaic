import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { compose } from "recompose";
import { Value } from "slate";
import { Editor } from "slate-react";
import { Auth } from "../auth";

export class MetaDataEditorPresentational extends React.Component<any, any> {
  public state = {
    value: this.props.valueAsJSON
      ?
      Value.fromJSON(this.props.valueAsJSON)
      :
      Value.fromJSON({
        document: {
          nodes: [
            {
              object: "block",
              type: "paragraph",
              nodes: [
                {
                  object: "text",
                  leaves: [
                    {
                      text: ""
                    }
                  ]
                }
              ]
            }
          ]
        }
      }),
  };

  public render() {
    return (
      <div
        style={{
          backgroundColor: "#fcfcfc",
          border: "1px solid #ddd",
          fontSize: "16px",
          marginBottom: "10px",
          maxWidth: "800px",
          padding: "10px",
        }}
      >
        <Editor
          onChange={this.onChange}
          readOnly={Auth.isAdmin()}
          style={{
            marginBottom: Auth.isAdmin() && "10px",
          }}
          value={this.state.value}
        />
        {
          Auth.isAdmin()
          &&
          <Button
            bsSize="xsmall"
            bsStyle="primary"
            onClick={this.onSave}
          >
          Save
          </Button>
        }
      </div>
    );
  }

  private onChange = change => this.setState({ value: change.value });
  
  private onSave = () => {
    this.props.updateExperimentMetadataMutation({
      variables: {
        experimentId: this.props.experimentId,
        metadata: JSON.stringify(this.state.value.toJSON()),
      }
    });
  }

}

const UPDATE_EXPERIMENT_METADATA_MUTATION = gql`
  mutation updateExperimentMetadata($experimentId: String, $metadata: String) {
    updateExperimentMetadata(experimentId: $experimentId, metadata: $metadata)
  }
`;

export const MetaDataEditor: any = compose(
  graphql(UPDATE_EXPERIMENT_METADATA_MUTATION, {
      name: "updateExperimentMetadataMutation",
  })
)(MetaDataEditorPresentational);
