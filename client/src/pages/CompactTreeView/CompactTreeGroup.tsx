import * as _ from "lodash";
import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { compose } from "recompose";
import { parse as parseQueryString } from "query-string";

import { CompactTreeRow } from "./CompactTreeRow";
import { CompactTreeRowLabel } from "./CompactTreeRowLabel";
import { CompactTreeRowContent } from "./CompactTreeRowContent";

import { MaliciousAnswerAndMaybeSubquestions } from "./MaliciousAnswerAndMaybeSubquestions";
import { MaliciousAnswerIfMaliciousWon } from "./MaliciousAnswerIfMaliciousWon";
import { LazyUnlockGroup } from "./LazyUnlockGroup";

import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";
import { extractOracleValueAnswerFromBlock } from "./helpers/extractOracleAnswerValueFromBlock";

const Checkmark = ({ color }) => <span style={{ color, fontSize: "24px" }}>✓</span>;

export class CompactTreeGroupPresentationl extends React.PureComponent<any, any> {
  public render() {
    const { workspace } = this.props;

    if (workspace.isRequestingLazyUnlock) {
      return (
        <LazyUnlockGroup
          availablePointers={this.props.availablePointers}
          isExpanded={this.props.isExpanded}
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

    if (!this.props.isExpanded) {
      return (
        <div>
          <CompactTreeRow>
            <CompactTreeRowLabel>Question</CompactTreeRowLabel>
            <CompactTreeRowContent>
              <BlockEditor
                name={honestQuestionBlock.id}
                blockId={honestQuestionBlock.id}
                readOnly={true}
                initialValue={questionValue}
                shouldAutosave={false}
                availablePointers={this.props.availablePointers}
              />
            </CompactTreeRowContent>
          </CompactTreeRow>
          {
            didHonestWin
            &&
            <CompactTreeRow>
              <CompactTreeRowLabel>
                <Checkmark color="green" /> Honest
              </CompactTreeRowLabel>
              <CompactTreeRowContent>
                <BlockEditor
                  name={honestScratchpadBlock.id}
                  blockId={honestScratchpadBlock.id}
                  readOnly={true}
                  initialValue={honestScratchpadValue}
                  shouldAutosave={false}
                  availablePointers={this.props.availablePointers}
                />
              </CompactTreeRowContent>
            </CompactTreeRow>
          }
          {
            !didHonestWin
            &&
            malicious
            &&
            <MaliciousAnswerIfMaliciousWon
              availablePointers={this.props.availablePointers}
              didHonestWin={didHonestWin}
              idOfPointerInHonestAnswerDraft={idOfPointerInHonestAnswerDraft}
              isHonestOracleCurrentlyResolved={isHonestOracleCurrentlyResolved}
              malicious={malicious}
            />
          }
        </div>
      );
    }

    return (
      <div>
        <CompactTreeRow>
          <CompactTreeRowLabel>Question</CompactTreeRowLabel>
          <CompactTreeRowContent>
            <BlockEditor
              name={honestQuestionBlock.id}
              blockId={honestQuestionBlock.id}
              readOnly={true}
              initialValue={questionValue}
              shouldAutosave={false}
              availablePointers={this.props.availablePointers}
            />
          </CompactTreeRowContent>
        </CompactTreeRow>

          <CompactTreeRow>
            <CompactTreeRowLabel>
              {didHonestWin && <Checkmark color="green" />}{" "}Honest
            </CompactTreeRowLabel>
            {
              malicious
              ?
              <CompactTreeRowContent>
                <BlockEditor
                  name={honestScratchpadBlock.id}
                  blockId={honestScratchpadBlock.id}
                  readOnly={true}
                  initialValue={honestScratchpadValue}
                  shouldAutosave={false}
                  availablePointers={this.props.availablePointers}
                />
              </CompactTreeRowContent>
              :
              <span style={{ color: "#999" }}>Waiting for response</span>
            }
          </CompactTreeRow>
        {
          malicious
          &&
          <MaliciousAnswerAndMaybeSubquestions
            availablePointers={this.props.availablePointers}
            didHonestWin={didHonestWin}
            idOfPointerInHonestAnswerDraft={idOfPointerInHonestAnswerDraft}
            isHonestOracleCurrentlyResolved={isHonestOracleCurrentlyResolved}
            malicious={malicious}
          />
        }
      </div>
    );
  }
}

export class CompactTreeGroupContainer extends React.PureComponent<any, any> {
  public state = {
    isExpanded: parseQueryString(window.location.search).expanded === "true" ? true : false,
  };

  public render() {
    return (
      <div
        style={{
          backgroundColor: "#fbfbfb ",
          border: "1px solid #ddd",
          borderRadius: "3px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 1px 2px rgba(0,0,0,.05)",
          marginTop: "25px",
          minHeight: "35px",
          padding: "10px",
          position: "relative",
        }}
      >
        <Button
          bsSize="xsmall"
          onClick={() => this.setState({isExpanded: !this.state.isExpanded})}
          style={{
            left: "5px",
            position: "absolute",
            top: "5px",
          }}
        >
          {this.state.isExpanded ? "-" : "+"}
        </Button>
        {
          this.props.groupQuery.workspace
          ?
          <CompactTreeGroupPresentationl
            availablePointers={this.props.availablePointers}
            isExpanded={this.state.isExpanded}
            workspace={this.props.groupQuery.workspace}
          />
          :
          <div style={{paddingLeft: "30px"}}>Loading...</div>
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
      isEligibleForHonestOracle
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

export const CompactTreeGroup: any = compose(
  graphql(GROUP_QUERY, {
    name: "groupQuery",
    options: (props: any) => ({
      variables: {
        workspaceId: props.workspaceId,
      }
    }),
  })
)(CompactTreeGroupContainer);