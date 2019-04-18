import * as _ from "lodash";
import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
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
            <Link
              target="_blank"
              to={`/workspaces/${workspace.parentId}`}
              style={{ color: "#333", textDecoration: "none" }}
            >
              <CompactTreeRowLabel>Q</CompactTreeRowLabel>
            </Link>
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
              <Link
                style={{ textDecoration: "none" }}
                target="_blank"
                to={`/workspaces/${workspace.id}`}
              >
                <CompactTreeRowLabel color="green">
                  <Checkmark color="green" /> H
                </CompactTreeRowLabel>
              </Link>
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
          <Link
            style={{ color: "#333", textDecoration: "none" }}
            target="_blank"
            to={`/workspaces/${workspace.parentId}`}
          >
            <CompactTreeRowLabel>Q</CompactTreeRowLabel>
          </Link>
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
            <Link
              style={{ textDecoration: "none" }}
              target="_blank"
              to={`/workspaces/${workspace.id}`}
            >
              <CompactTreeRowLabel color="green">
                {didHonestWin && <Checkmark color="green" />}{" "}H
              </CompactTreeRowLabel>
            </Link>
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
          borderLeft: "2px solid #bbb",
          borderRadius: "3px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 1px 2px rgba(0,0,0,.05)",
          marginTop: "35px",
          minHeight: "35px",
          padding: "10px",
          paddingRight: "40px",
          position: "relative",
        }}
      >
        <Button
          bsSize="xsmall"
          onClick={() => this.setState({isExpanded: !this.state.isExpanded})}
          style={{
            lineHeight: "17px",
            height: "20px",
            width: "20px",
            right: "5px",
            position: "absolute",
            textAlign: "center",
            top: "5px",
          }}
        >
          {this.state.isExpanded ? "-" : "+"}
        </Button>
        <a
          href={this.props.groupQuery.workspace && `/workspaces/${this.props.groupQuery.workspace.id}/compactTree`}
          style={{
            right: "5px",
            position: "absolute",
            top: "26px",
          }}
        >
          <Button
            bsSize="xsmall"
            style={{
              height: "20px",
              lineHeight: "15px",
              textAlign: "center",
              width: "20px",
            }}
          >
            »
          </Button>
        </a>
        {
          this.props.groupQuery.workspace
          ?
          <div
            style={{ opacity: this.props.groupQuery.workspace.isArchived ? 0.2 : 1 }}
          >
            <CompactTreeGroupPresentationl
              availablePointers={this.props.availablePointers}
              isExpanded={this.state.isExpanded}
              workspace={this.props.groupQuery.workspace}
            />
          </div>
          :
          <div style={{ paddingBottom: "17px",  paddingLeft: "20px"}}>Loading...</div>
        }
      </div>
    );
  }
}

export const GROUP_QUERY = gql`
  query groupQuery($workspaceId: String!) {
    workspace(id: $workspaceId) {
      id
      parentId
      isArchived
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