import gql from "graphql-tag";
import * as _ from "lodash";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button, Checkbox, OverlayTrigger, Popover } from "react-bootstrap";
import { compose } from "recompose";

export class FallbacksPresentational extends React.Component<any,  any> {
  public state = {
    pending: false,
  }

  public componentDidUpdate(prevProps: any, prevState: any) {
    const didStatusChange = prevProps.experiment.fallbacks.length !== this.props.experiment.fallbacks.length;

    if (didStatusChange) {
      this.setState({ pending: false });
    }
  }

  public handleOnChange = (event, experimentId, fallbackId) => {
    const isChecked = event.target.checked;

    this.setState({ pending: true }, async () => {
      if (isChecked) {
        await this.props.addFallbackToExperimentMutation({
          variables: {
            experimentId,
            fallbackId,
          }
        });
      } else {
        await this.props.removeFallbackFromExperimentMutation({
          variables: {
            experimentId,
            fallbackId,
          }
        });
        }
    });
  };
  
  public render() {
    const experiments =  this.props.experimentsQuery.experiments && _.sortBy(
      this.props.experimentsQuery.experiments,
      experiment => Date.parse(experiment.createdAt)
    );

    const popoverWithProps = (
      this.props.experimentsQuery.loading
      ?
        <div />
      :
        (
          <Popover
            id={`fallbacks-popover-${this.props.experiment.id}`}
            title="Fallbacks"
          >
            <div
              style={{
                opacity: this.state.pending ? 0.5 : 1,
              }}
            >
              {
                experiments
                  .filter(e => e.id !== this.props.experiment.id)
                  .map(e => {
                    return (
                      <Checkbox
                        key={e.id}
                        checked={
                          this.props.experiment.fallbacks.find(f => f.id === e.id)
                          ?
                          true
                          :
                          false
                        }
                        disabled={this.state.pending}
                        onChange={event => this.handleOnChange(event, this.props.experiment.id, e.id)}
                      >
                        {e.name}
                      </Checkbox>
                    );
                })
              }
            </div>
          </Popover>
        )
    );

    const fallbacks = this.props.experiment.fallbacks;

    return (
      <div
        style={{
          marginTop: "8px",
        }}
      >
        <OverlayTrigger trigger="click" placement="right" overlay={popoverWithProps}>
          <Button bsSize="xsmall" bsStyle="default">Edit Fallbacks</Button>
        </OverlayTrigger>
        <div style={{ marginTop: "5px"}}>
        Current fallbacks: {
          fallbacks.length === 0
          ?
          "none"
          :
          <ul>
            {fallbacks.map((f, i, arr) => <li key={`${this.props.experiment.id}${f.id}`}>{f.name}</li>)}
          </ul>
        }
        </div>
      </div>
    );
  }
}

const EXPERIMENTS_QUERY = gql`
  query experiments {
    experiments {
      id
      createdAt
      name
    }
  }
`;

const ADD_FALLBACK_TO_EXPERIMENT_MUTATION = gql`
  mutation addFallbackToExperiment($experimentId: String, $fallbackId: String) {
    addFallbackToExperiment(experimentId: $experimentId, fallbackId: $fallbackId)
  }
`;

const REMOVE_FALLBACK_FROM_EXPERIMENT_MUTATION = gql`
  mutation removeFallbackFromExperiment($experimentId: String, $fallbackId: String) {
    removeFallbackFromExperiment(experimentId: $experimentId, fallbackId: $fallbackId)
  }
`;

export const Fallbacks: any = compose(
  graphql(EXPERIMENTS_QUERY, {
    name: "experimentsQuery",
  }),
  graphql(ADD_FALLBACK_TO_EXPERIMENT_MUTATION, {
    name: "addFallbackToExperimentMutation",
    options: {
      refetchQueries: ["experiments"]
    }
  }),
  graphql(REMOVE_FALLBACK_FROM_EXPERIMENT_MUTATION, {
    name: "removeFallbackFromExperimentMutation",
    options: {
      refetchQueries: ["experiments"]
    }
  })
)(FallbacksPresentational);
