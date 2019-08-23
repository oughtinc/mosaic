import * as _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";
import { Button } from "react-bootstrap";
import { resetBlock } from "../modules/blocks/actions";
import { ChildBudgetBadge } from "./ChildBudgetBadge";
import { Redirect } from "react-router-dom";

import {
  blockBorderAndBoxShadow,
  blockHeaderCSS,
  blockBodyCSS,
  newQuestionFormFooterBgColor,
  newQuestionFormBorderTopColor,
} from "../styles";

const BlockContainer = styled.div`
  ${blockBorderAndBoxShadow};
  margin-bottom: 25px;
`;

const BlockBody = styled.div`
  ${blockBodyCSS};
`;

const BlockHeader = styled.div`
  ${blockHeaderCSS};
`;

export class NewBlockFormPresentational extends React.Component<any, any> {
  public blockEditor;

  private onSubmit = _.throttle(({ shouldOverrideToNormalUser = false }) => {
    const isOnFrontPage = !this.props.shouldAutosave;

    // front page doesn't receive a prop when workspaces reload
    // so for now I'm not putting in a pending state, because it would be
    // pretty involved telling it to go out of the pending state
    if (isOnFrontPage) {
      this.setState({ totalBudget: 90 }, () => {
        this.props.resetBlock({ id: this.props.blockId });
      });
    } else {
      this.setState({ pending: true });
    }

    this.props.onMutate({
      question: valueToDatabaseJSON(this.state.blockValue),
      shouldOverrideToNormalUser,
      totalBudget: this.props.hasTimeBudget ? this.state.totalBudget : 0,
    });

    this.props.resetBlock({ id: this.props.blockId });
  }, 3000);

  public constructor(props: any) {
    super(props);
    this.state = {
      pending: false,
      shouldRedirectToBreakPage: false,
      totalBudget: this.props.totalBudget || 90,
    };
  }

  public componentWillReceiveProps(newProps) {
    if (
      this.state.pending &&
      newProps.numBlocksInRedux > this.props.numBlocksInRedux // This checks whether the newly asked sub-question has made it into Redux
    ) {
      if (this.props.isMIBWithoutRestarts) {
        this.props.snapshot("WAIT_FOR_ANSWER");
        this.props.markAsNotStale();
        this.setState({
          shouldRedirectToBreakPage: true,
        });
      }

      this.setState({
        pending: false,
        totalBudget: 90,
      });
    }
  }

  public render() {
    // front page doesn't receive a prop when workspaces reload
    // so for now I'm not putting in a pending state, because it would be
    // pretty involved telling it to go out of the pending state
    const isOnFrontPage = !this.props.shouldAutosave;

    return (
      <div
        key={this.state.id}
        style={{
          opacity: isOnFrontPage
            ? 1
            : this.state.pending ||
              (this.props.hasTimeBudget && this.props.availableBudget < 90)
            ? 0.5
            : 1,
        }}
      >
        {this.state.shouldRedirectToBreakPage && (
          <Redirect to={`/break?e=${this.props.experimentId}`} />
        )}
        <BlockContainer>
          <BlockHeader>New Question</BlockHeader>
          <BlockBody>
            <BlockEditor
              isActive={this.props.isActive}
              isUserOracle={this.props.isUserOracle}
              pastedExportFormat={this.props.pastedExportFormat}
              shouldAutoExport={this.props.shouldAutoExport}
              placeholder="Text of a new question..."
              shouldAutosave={this.props.shouldAutosave}
              readOnly={false}
              blockId={this.props.blockId ? this.props.blockId : this.state.id}
              name={`new-block-${this.state.id}`}
              initialValue={this.props.initialValue || ""}
              onChange={this.onChange}
              availablePointers={this.props.availablePointers || []}
              workspaceId={this.props.workspaceId}
              visibleExportIds={this.props.visibleExportIds}
              exportLockStatusInfo={this.props.exportLockStatusInfo}
              unlockPointer={this.props.unlockPointer}
              cyAttributeName="slate-editor-new-question-form"
            />
          </BlockBody>
          <div
            style={{
              backgroundColor: newQuestionFormFooterBgColor,
              borderRadius: "0 0 3px 3px",
              borderTop: `1px solid ${newQuestionFormBorderTopColor}`,
              padding: "10px",
            }}
          >
            <div
              style={{
                display: this.props.hasTimeBudget ? "block" : "none",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  marginRight: "5px",
                }}
              >
                Budget
              </span>
              <ChildBudgetBadge totalBudget={this.state.totalBudget} />
              <br />
              <Button
                bsSize="xsmall"
                bsStyle="default"
                disabled={
                  this.props.availableBudget - 90 <
                  Number(this.state.totalBudget) + 90
                    ? true
                    : false
                }
                style={{ marginRight: "5px", marginTop: "10px" }}
                onClick={() => {
                  this.setState({
                    totalBudget: Number(this.state.totalBudget) + 90,
                  });
                }}
              >
                +90s
              </Button>
              <Button
                bsSize="xsmall"
                bsStyle="default"
                disabled={
                  this.props.availableBudget - 90 <
                  Number(this.state.totalBudget) * 2
                    ? true
                    : false
                }
                style={{ marginRight: "5px", marginTop: "10px" }}
                onClick={() => {
                  this.setState({
                    totalBudget: this.state.totalBudget * 2,
                  });
                }}
              >
                x2
              </Button>
              <Button
                bsSize="xsmall"
                bsStyle="default"
                disabled={
                  Math.floor(this.state.totalBudget / 2) < 90 ? true : false
                }
                style={{ marginRight: "5px", marginTop: "10px" }}
                onClick={() => {
                  this.setState({
                    totalBudget: Math.floor(this.state.totalBudget / 2),
                  });
                }}
              >
                /2
              </Button>
              <Button
                bsSize="xsmall"
                bsStyle="default"
                disabled={this.state.totalBudget - 90 < 90 ? true : false}
                style={{ marginTop: "10px" }}
                onClick={() => {
                  this.setState({
                    totalBudget: this.state.totalBudget - 90,
                  });
                }}
              >
                -90s
              </Button>
              {!isOnFrontPage && (
                <span>
                  <span
                    style={{
                      display: "inline-block",
                      position: "relative",
                      top: "5px",
                      textAlign: "center",
                      width: "20px",
                    }}
                  >
                    |
                  </span>
                  <Button
                    bsSize="xsmall"
                    bsStyle="default"
                    disabled={this.props.availableBudget - 90 < 90}
                    style={{ marginRight: "5px", marginTop: "10px" }}
                    onClick={() => {
                      this.setState({
                        totalBudget: 90,
                      });
                    }}
                  >
                    min
                  </Button>
                  <Button
                    bsSize="xsmall"
                    bsStyle="default"
                    disabled={
                      this.props.availableBudget - 90 <
                        Math.floor(
                          Number(this.props.parentTotalBudget) * 0.2,
                        ) ||
                      Math.floor(Number(this.props.parentTotalBudget) * 0.2) <
                        90
                        ? true
                        : false
                    }
                    style={{ marginRight: "5px", marginTop: "10px" }}
                    onClick={() => {
                      this.setState({
                        totalBudget: Math.floor(
                          Number(this.props.parentTotalBudget) * 0.2,
                        ),
                      });
                    }}
                  >
                    20%
                  </Button>
                  <Button
                    bsSize="xsmall"
                    bsStyle="default"
                    disabled={
                      this.props.availableBudget - 90 <
                        Math.floor(
                          Number(this.props.parentTotalBudget) * 0.4,
                        ) ||
                      Math.floor(Number(this.props.parentTotalBudget) * 0.4) <
                        90
                        ? true
                        : false
                    }
                    style={{ marginRight: "5px", marginTop: "10px" }}
                    onClick={() => {
                      this.setState({
                        totalBudget: Math.floor(
                          Number(this.props.parentTotalBudget) * 0.4,
                        ),
                      });
                    }}
                  >
                    40%
                  </Button>
                  <Button
                    bsSize="xsmall"
                    bsStyle="default"
                    disabled={
                      this.props.availableBudget - 90 <
                        Math.floor(
                          Number(this.props.parentTotalBudget) * 0.8,
                        ) ||
                      Math.floor(Number(this.props.parentTotalBudget) * 0.8) <
                        90
                        ? true
                        : false
                    }
                    style={{ marginRight: "5px", marginTop: "10px" }}
                    onClick={() => {
                      this.setState({
                        totalBudget: Math.floor(
                          Number(this.props.parentTotalBudget) * 0.8,
                        ),
                      });
                    }}
                  >
                    80%
                  </Button>
                  <Button
                    bsSize="xsmall"
                    bsStyle="default"
                    disabled={this.props.availableBudget - 90 < 90}
                    style={{ marginTop: "10px" }}
                    onClick={() => {
                      this.setState({
                        totalBudget: Math.max(
                          0,
                          this.props.availableBudget - 90,
                        ),
                      });
                    }}
                  >
                    max
                  </Button>
                </span>
              )}
            </div>
            <Button
              bsSize="xsmall"
              bsStyle="primary"
              data-cy="submit-new-question"
              disabled={
                this.props.hasTimeBudget &&
                this.props.availableBudget - 90 < this.state.totalBudget
              }
              type="submit"
              onClick={() =>
                this.handleClick({ shouldOverrideToNormalUser: false })
              }
              style={{
                marginRight: "10px",
                marginTop: this.props.hasTimeBudget ? "10px" : "0px",
              }}
            >
              {this.props.isWorkspacePartOfOracleExperiment &&
              !this.props.isUserOracle
                ? "Submit to Expert"
                : "Submit"}
            </Button>
            {this.props.isWorkspacePartOfOracleExperiment &&
              !this.props.isUserOracle &&
              this.props.doesAllowOracleBypass && (
                <Button
                  bsSize="xsmall"
                  bsStyle="danger"
                  type="submit"
                  onClick={() =>
                    this.handleClick({ shouldOverrideToNormalUser: true })
                  }
                >
                  Submit to Judge
                </Button>
              )}
          </div>
        </BlockContainer>
      </div>
    );
  }

  private onChange = blockValue => {
    this.setState({ blockValue });
  };

  private handleClick = ({ shouldOverrideToNormalUser = false }) => {
    const isOnFrontPage = !this.props.shouldAutosave;

    if (isOnFrontPage) {
      this.onSubmit({ shouldOverrideToNormalUser });
    } else {
      setTimeout(() => this.onSubmit({ shouldOverrideToNormalUser }), 1);
    }
  };
}

const mapStateToProps = state => ({
  numBlocksInRedux: state.blocks.blocks.length,
});

const mapDispatchToProps = dispatch => ({
  resetBlock: ({ id }) => dispatch(resetBlock({ id })),
});

export const NewBlockForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NewBlockFormPresentational);
