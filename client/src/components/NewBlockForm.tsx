import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";
import { Button } from "react-bootstrap";
import { resetBlock } from "../modules/blocks/actions";
import { ChildBudgetBadge } from "../pages/EpisodeShowPage/ChildBudgetBadge";

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
  public constructor(props: any) {
    super(props);
    this.state = {
      pending: false,
      totalBudget: this.props.totalBudget || 90,
    };
  }

  public onChange = blockValue => {
    this.setState({ blockValue });
  };

  public componentWillReceiveProps() {
    if (this.state.pending) {
      this.setState({ pending: false, totalBudget: 90 }, () => {
        this.props.resetBlock({ id: this.props.blockId });
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
          opacity: isOnFrontPage ? 1 : (this.state.pending || this.props.availableBudget < 90 ? 0.5 : 1)
        }}
      >
        <BlockContainer>
          <BlockHeader>New Question</BlockHeader>
          <BlockBody>
            <BlockEditor
              placeholder="Text of a new question..."
              shouldAutosave={this.props.shouldAutosave}
              readOnly={false}
              blockId={this.props.blockId ? this.props.blockId : this.state.id}
              name={`new-block-${this.state.id}`}
              initialValue={this.props.initialValue || ""}
              onChange={this.onChange}
              availablePointers={this.props.availablePointers || []}
              onKeyDown={this.onKeyDown}
              /*ref={input => (this.blockEditor = input)}*/
              workspaceId={this.props.workspaceId}
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
            <div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  marginRight: "5px",
                }}
              >
                Budget
              </span>
                <ChildBudgetBadge
                  totalBudget={this.state.totalBudget}
                />
                <br />
                <Button
                  bsSize="xsmall"
                  bsStyle="default"
                  disabled={this.props.availableBudget < (Number(this.state.totalBudget) + 90) ? true : false}
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
                  disabled={this.props.availableBudget < (Number(this.state.totalBudget) * 2) ? true : false}
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
                    Math.floor(this.state.totalBudget / 2) < 90
                    ?
                    true
                    :
                    false
                  }
                  style={{ marginRight: "5px", marginTop: "10px" }}
                  onClick={() => {
                    this.setState({
                      totalBudget: Math.floor(this.state.totalBudget / 2),
                    });
                  }}
                >
                  ÷2
                </Button>
                <Button
                  bsSize="xsmall"
                  bsStyle="default"
                  disabled={
                    this.state.totalBudget - 90 < 90
                    ?
                    true
                    :
                    false
                  }
                  style={{ marginTop: "10px" }}
                  onClick={() => {
                    this.setState({
                      totalBudget: this.state.totalBudget - 90,
                    });
                  }}
                >
                  -90s
                </Button>
                {
                  !isOnFrontPage
                  &&
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
                        this.props.availableBudget - 90 < Math.floor(Number(this.props.parentTotalBudget) * 0.2)
                        ||
                        Math.floor(Number(this.props.parentTotalBudget) * 0.2) < 90
                        ?
                        true
                        :
                        false
                      }
                      style={{ marginRight: "5px", marginTop: "10px" }}
                      onClick={() => {
                        this.setState({
                          totalBudget: Math.floor(Number(this.props.parentTotalBudget) * 0.2),
                        });
                      }}
                    >
                      20%
                    </Button>
                    <Button
                      bsSize="xsmall"
                      bsStyle="default"
                      disabled={
                        this.props.availableBudget - 90 < Math.floor(Number(this.props.parentTotalBudget) * 0.4)
                        ||
                        Math.floor(Number(this.props.parentTotalBudget) * 0.4) < 90
                        ?
                        true
                        :
                        false
                      }
                      style={{ marginRight: "5px", marginTop: "10px" }}
                      onClick={() => {
                        this.setState({
                          totalBudget: Math.floor(Number(this.props.parentTotalBudget) * 0.4),
                        });
                      }}
                    >
                      40%
                    </Button>
                    <Button
                      bsSize="xsmall"
                      bsStyle="default"
                      disabled={
                        this.props.availableBudget - 90 < Math.floor(Number(this.props.parentTotalBudget) * 0.8)
                        ||
                        Math.floor(Number(this.props.parentTotalBudget) * 0.8) < 90
                        ?
                        true
                        :
                        false
                      }
                      style={{ marginRight: "5px", marginTop: "10px" }}
                      onClick={() => {
                        this.setState({
                          totalBudget: Math.floor(Number(this.props.parentTotalBudget) * 0.8),
                        });
                      }}
                    >
                      80%
                    </Button>
                    <Button
                      bsSize="xsmall"
                      bsStyle="default"
                      disabled={this.props.availableBudget < 90 ? true : false}
                      style={{ marginTop: "10px" }}
                      onClick={() => {
                        this.setState({
                          totalBudget: Math.max(0, this.props.availableBudget - 90),
                        });
                      }}
                    >
                      max
                    </Button>
                  </span>
              }
              <br />
              <Button
                bsSize="xsmall"
                bsStyle="primary"
                disabled={this.props.availableBudget < Number(this.state.totalBudget) ? true : false}
                type="submit"
                onClick={this.onSubmit}
                style={{ marginTop: "10px" }}
              >
                Submit
              </Button>
            </div>
          </div>
        </BlockContainer>
      </div>
    );
  }

  private onKeyDown = event => {
    const pressedControlAndEnter = _event =>
      _event.metaKey && _event.key === "Enter";

    if (pressedControlAndEnter(event)) {
      event.preventDefault();
      this.onSubmit();
    }
  };

  private onSubmit = () => {
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
      totalBudget: this.state.totalBudget,
    });
  };
}

const mapDispatchToProps = dispatch => ({
  resetBlock: ({ id }) => dispatch(resetBlock({ id })),
});

export const NewBlockForm = connect(
  undefined,
  mapDispatchToProps,
)(NewBlockFormPresentational);
