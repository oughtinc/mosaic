import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { compose } from "recompose";
import { Value } from "slate";
import { Editor } from "slate-react";
import { Auth } from "../auth";
import { LinkifyPlugin } from "../lib/slate-plugins/linkifyPlugin";

const linkifyPlugin = LinkifyPlugin();

const plugins = [linkifyPlugin];

export class MetaDataEditorPresentational extends React.Component<any, any> {
  public state = {
    isSavePending: false,
    didSaveJustSuccesfullyOccur: false,
    value: this.props.valueAsJSON
      ? Value.fromJSON(this.props.valueAsJSON)
      : Value.fromJSON({
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
                        text: "",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }),
  };

  public render() {
    return (
      <div>
        <Editor
          onChange={this.onChange}
          placeholder={"Experiment metadata..."}
          plugins={plugins}
          readOnly={!Auth.isAdmin()}
          style={{
            marginBottom: Auth.isAdmin() && "10px",
          }}
          value={this.state.value}
        />
        {Auth.isAdmin() && (
          <Button
            bsSize="xsmall"
            bsStyle="primary"
            disabled={
              this.state.isSavePending || this.state.didSaveJustSuccesfullyOccur
            }
            onClick={this.onSave}
          >
            {this.state.isSavePending
              ? "Saving..."
              : this.state.didSaveJustSuccesfullyOccur
              ? "Saved!"
              : "Save"}
          </Button>
        )}
      </div>
    );
  }

  private onChange = change => this.setState({ value: change.value });

  private onSave = () => {
    this.setState({ isSavePending: true }, async () => {
      await this.props.updateExperimentMetadataMutation({
        variables: {
          experimentId: this.props.experimentId,
          metadata: JSON.stringify(this.state.value.toJSON()),
        },
      });
      this.setState(
        {
          didSaveJustSuccesfullyOccur: true,
          isSavePending: false,
        },
        () => {
          setTimeout(
            () => this.setState({ didSaveJustSuccesfullyOccur: false }),
            1000,
          );
        },
      );
    });
  };
}

const UPDATE_EXPERIMENT_METADATA_MUTATION = gql`
  mutation updateExperimentMetadata($experimentId: String, $metadata: String) {
    updateExperimentMetadata(experimentId: $experimentId, metadata: $metadata)
  }
`;

export const MetaDataEditor: any = compose(
  graphql(UPDATE_EXPERIMENT_METADATA_MUTATION, {
    name: "updateExperimentMetadataMutation",
  }),
)(MetaDataEditorPresentational);
