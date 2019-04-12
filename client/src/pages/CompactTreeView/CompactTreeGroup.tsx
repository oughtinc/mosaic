import * as _ from "lodash";
import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { compose } from "recompose";

import { LazyUnlockGroup } from "./LazyUnlockGroup";
import { NoChallengeGroup } from "./NoChallengeGroup";

import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";
import { extractOracleValueAnswerFromBlock } from "./helpers/extractOracleAnswerValueFromBlock";

export class CompactTreeGroupContainer extends React.PureComponent<any, any> {
  public state = {
    isShowing: true,
  };

  public render() {
    return (
      <div style={{
        backgroundColor: "#f9f9f9",
        border: "1px solid #bbb",
        marginTop: "15px",
        minHeight: "35px",
        padding: "10px",
        position: "relative",
      }}
    >
        <Button
          bsSize="xsmall"
          onClick={() => this.setState({isShowing: !this.state.isShowing})}
          style={{
            left: "5px",
            position: "absolute",
            top: "5px",
          }}
        >
          {this.state.isShowing ? "-" : "+"}
        </Button>
        {
          this.props.groupQuery.workspace
          ?
          <div style={{display: this.state.isShowing ? "block" : "none"}}>
            <CompactTreeGroupPresentationl
              availablePointers={this.props.availablePointers}
              workspace={this.props.groupQuery.workspace}
            />
          </div>
          :
          "Loading..."
        }
      </div>
    );
  }
}

export class CompactTreeGroupPresentationl extends React.PureComponent<any, any> {
    public render() {
      const { workspace } = this.props;

      if (workspace.isRequestingLazyUnlock) {
        return (
          <LazyUnlockGroup
            availablePointers={this.props.availablePointers}
            workspace={workspace}
          />
        );
      }

      const honestQuestionBlock = workspace.blocks.find(b => b.type === "QUESTION");
      const questionValue = databaseJSONToValue(honestQuestionBlock.value);

      const honestScratchpadBlock = workspace.blocks.find(b => b.type === "SCRATCHPAD");
      const honestScratchpadValue = extractOracleValueAnswerFromBlock(honestScratchpadBlock);

      const isHonestOracleCurrentlyResolved = workspace.isCurrentlyResolved;

      const idOfPointerInHonestScratchpad = _.get(honestScratchpadBlock, "value[0].nodes[1].data.pointerId");
      const honestAnswerDraftBlock = workspace.blocks.find(b => b.type === "ANSWER_DRAFT");
      const idOfPointerInHonestAnswerDraft = _.get(honestAnswerDraftBlock, "value[0].nodes[1].data.pointerId");
      const isSamePointerInHonestScratchpadAndAnswerDraft = idOfPointerInHonestScratchpad === idOfPointerInHonestAnswerDraft;
      const didHonestWin = isHonestOracleCurrentlyResolved && isSamePointerInHonestScratchpadAndAnswerDraft;

      const malicious = workspace.childWorkspaces[0];
      const maliciousScratchpadBlock = malicious.blocks.find(b => b.type === "SCRATCHPAD");
      const maliciousScratchpadValue = extractOracleValueAnswerFromBlock(maliciousScratchpadBlock);

      const idOfPointerInMaliciousScratchpad = _.get(maliciousScratchpadBlock, "value[0].nodes[1].data.pointerId");
      const isSamePointerInMaliciousScratchpadAndHonestAnswerDraft = idOfPointerInMaliciousScratchpad === idOfPointerInHonestAnswerDraft;
      const didMaliciousWin = isHonestOracleCurrentlyResolved && isSamePointerInMaliciousScratchpadAndHonestAnswerDraft;

      const normal = malicious.childWorkspaces[0];

      const didMaliciousDeclineToChallenge = didHonestWin && !normal;

      const Checkmark = ({ color }) => <span style={{ color, fontSize: "24px" }}>✓</span>;

      return (
        <div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                paddingRight: "10px",
                textAlign: "right",
                width: "100px",
              }}
            >
              Question
            </div>
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                padding: "5px",
              }}
            >
              <BlockEditor
                name={honestQuestionBlock.id}
                blockId={honestQuestionBlock.id}
                readOnly={true}
                initialValue={questionValue}
                shouldAutosave={false}
                availablePointers={this.props.availablePointers}
              />
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                paddingRight: "10px",
                textAlign: "right",
                width: "100px",
              }}
            >
              {didHonestWin && <Checkmark color="green" />}{" "}Honest
            </div>
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                padding: "5px",
              }}
            >
              <BlockEditor
                name={honestScratchpadBlock.id}
                blockId={honestScratchpadBlock.id}
                readOnly={true}
                initialValue={honestScratchpadValue}
                shouldAutosave={false}
                availablePointers={this.props.availablePointers}
              />
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "5px",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                paddingRight: "10px",
                textAlign: "right",
                width: "100px",
              }}
            >
              {didMaliciousWin && <Checkmark color="red" />}{" "}Malicious
            </div>
            {
              didMaliciousDeclineToChallenge
              ?
              <span style={{ color: "red"}}>No challenge</span>
              :
              <div
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  padding: "5px",
                }}
              >
                <BlockEditor
                  name={maliciousScratchpadBlock.id}
                  blockId={maliciousScratchpadBlock.id}
                  readOnly={true}
                  initialValue={maliciousScratchpadValue}
                  shouldAutosave={false}
                  availablePointers={this.props.availablePointers}
                />
              </div>
            }

          </div>
          {
            !didMaliciousDeclineToChallenge
            &&
            <div style={{ paddingLeft: "10px" }}>
              {_.sortBy(normal.childWorkspaces, w => Date.parse(w.createdAt)).map(c =>
                <div key={c.id} style={{marginBottom: "10px"}}>
                  <CompactTreeGroup
                    availablePointers={this.props.availablePointers}
                    workspaceId={c.id}
                  />
                </div>
              )}
            </div>
          }
        </div>
      );
    }
  }

  export const GROUP_QUERY = gql`
  query groupQuery($workspaceId: String!) {
    workspace(id: $workspaceId) {
      id
      isCurrentlyResolved
      isRequestingLazyUnlock
      connectedPointersOfSubtree
      blocks {
        id
        value
        type
      }
      childWorkspaces {
        id
        isCurrentlyResolved
        blocks {
          id
          value
          type
        }
        childWorkspaces {
          id
          blocks {
            id
            value
            type
          }
          childWorkspaces {
            id
            createdAt
            isRequestingLazyUnlock
          }
        }
      }
    }
  }
`;

export const CompactTreeGroup : any = compose(
  graphql(GROUP_QUERY, {
    name: "groupQuery",
    options: (props: any) => ({
      variables: {
        workspaceId: props.workspaceId,
      }
    }),
  })
)(CompactTreeGroupContainer);