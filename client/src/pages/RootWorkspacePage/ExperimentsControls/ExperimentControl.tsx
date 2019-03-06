import * as React from "react";
import {
  ControlLabel,
  FormControl,
  FormGroup,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";  

import { Fallbacks } from "./Fallbacks";

const wordLinkStyle = {
  color: "#369",
  cursor: "pointer",
  fontSize: "11px",
  marginLeft: "5px",
  textDecoration: "underline",
};

class ExperimentControl extends React.Component<any, any> {
  public state = {
    isEditNameFieldDisabled: false,
    isShowingEditNameField: false,
    valueOfEditNameField: this.props.experiment.name,
  };

  public render() {
    const { experiment } = this.props;

    return (
        <FormGroup controlId="formControlsSelect">
          {
          !this.state.isShowingEditNameField
          ?
            <span>
              <Link to={`/experiments/${experiment.id}`}>
                <ControlLabel style={{ cursor: "pointer" }}>{experiment.name}</ControlLabel>
              </Link> 
              <span
                onClick={this.showEditNameField}
                style={wordLinkStyle}
              >
                edit name
              </span>
            </span>
          :
            <span>
              <FormControl
                autoFocus={true}
                disabled={this.state.isEditNameFieldDisabled}
                onChange={this.handleChangeOfEditNameField}
                placeholder="name of experiment (metadata can be added later on the Experiments page)"
                style={{
                  display: "inline-block",
                  marginBottom: "5px",
                  width: "150px",
                }}
                type="text"
                value={this.state.valueOfEditNameField}
              />
              <span
                onClick={this.updateExperimentName}
                style={wordLinkStyle}
              >
                save
              </span>
              <span
                onClick={this.cancelEditingName}
                style={wordLinkStyle}
              >
                cancel
              </span>
            </span>
          }
          <ToggleButtonGroup
            bsSize="xsmall"
            style={{
              display: "inline-block",
              marginLeft: "10px",
            }}
            type="radio"
            name="options"
            value={experiment.are === null ? 0 : experiment.eligibilityRank}
            onChange={value => this.props.onEligibilityRankChange(experiment.id, value)}
          >
            <ToggleButton value={1}>active</ToggleButton>
            <ToggleButton value={0}>inactive</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            bsSize="xsmall"
            style={{
              display: "inline-block",
              marginLeft: "10px",
            }}
            type="radio"
            name="options"
            value={experiment.areNewWorkspacesOracleOnlyByDefault ? 1 : 0}
            onChange={value => this.props.onDefaultOracleChange(experiment.id, value === 1 ? true : false)}
          >
            <ToggleButton value={0}>default non-oracle</ToggleButton>
            <ToggleButton value={1}>default oracle</ToggleButton>
          </ToggleButtonGroup>
          <br />
          <Fallbacks experiment={experiment} />
        </FormGroup>
    );
  }

  private showEditNameField = () => {
    this.setState({ isShowingEditNameField: true });
  };

  private cancelEditingName = () => {
    this.setState({
      isShowingEditNameField: false,
      valueOfEditNameField: this.props.experiment.name,
    });
  };

  private updateExperimentName = () => {
    this.setState({
      isEditNameFieldDisabled: true,
    }, async () => {
      await this.props.updateExperimentName({
        experimentId: this.props.experiment.id,
        name: this.state.valueOfEditNameField,
      });

      this.setState({
        isEditNameFieldDisabled: false,
        isShowingEditNameField: false,
      });
    });
  }

  private handleChangeOfEditNameField = e => {
    this.setState({ valueOfEditNameField: e.target.value });
  };
}

export { ExperimentControl };
