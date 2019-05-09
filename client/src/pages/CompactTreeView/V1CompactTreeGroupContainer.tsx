import * as _ from "lodash";
import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { CompactTreeGroup } from "./CompactTreeGroup";
import { databaseJSONToValue } from "../../lib/slateParser";
import { extractOracleValueAnswerFromBlock } from "./helpers/extractOracleAnswerValueFromBlock";

export class CompactTreeGroupContainerBase extends React.PureComponent<
  any,
  any
> {
  public render() {
    const hasLoaded = this.props.groupQuery.workspace;

    if (!hasLoaded) {
      return <CompactTreeGroup hasLoaded={false} />;
    } else {
      const { workspace } = this.props.groupQuery;

      const isWorkspaceNormal =
        !workspace.isEligibleForHonestOracle &&
        !workspace.isEligibleForMaliciousOracle;

      const honestQuestionBlock = workspace.blocks.find(
        b => b.type === "QUESTION",
      );

      const questionValue = databaseJSONToValue(honestQuestionBlock.value);

      const honestScratchpadBlock = workspace.blocks.find(
        b => b.type === "SCRATCHPAD",
      );
      const honestScratchpadValue = extractOracleValueAnswerFromBlock(
        honestScratchpadBlock,
      );

      const isHonestOracleCurrentlyResolved = workspace.isCurrentlyResolved;

      const idOfPointerInHonestScratchpad = _.get(
        honestScratchpadBlock,
        "value[0].nodes[1].data.pointerId",
      );
      const honestAnswerDraftBlock = workspace.blocks.find(
        b => b.type === "ANSWER_DRAFT",
      );
      const idOfPointerInHonestAnswerDraft = _.get(
        honestAnswerDraftBlock,
        "value[0].nodes[1].data.pointerId",
      );
      const isSamePointerInHonestScratchpadAndAnswerDraft =
        idOfPointerInHonestScratchpad === idOfPointerInHonestAnswerDraft;

      const didHonestWin =
        isHonestOracleCurrentlyResolved &&
        isSamePointerInHonestScratchpadAndAnswerDraft;

      const malicious = workspace.childWorkspaces[0];

      const answerDraftBlock = workspace.blocks.find(
        b => b.type === "ANSWER_DRAFT",
      );

      const answerDraftValue = databaseJSONToValue(answerDraftBlock.value);

      if (!malicious) {
        return (
          <CompactTreeGroup
            availablePointers={this.props.availablePointers}
            didHonestWin={didHonestWin}
            hasLoaded={true}
            honestAnswerBlockId={honestScratchpadBlock.id}
            honestAnswerValue={honestScratchpadValue}
            isExpanded={this.props.isExpanded}
            isRequestingLazyUnlock={workspace.isRequestingLazyUnlock}
            isWorkspaceNormal={isWorkspaceNormal}
            malicious={malicious}
            oracleBypassAnswerBlockId={answerDraftBlock.id}
            oracleBypassAnswerValue={answerDraftValue}
            questionBlockId={honestQuestionBlock.id}
            questionValue={questionValue}
            workspace={workspace}
          />
        );
      }

      const maliciousScratchpadBlock = malicious.blocks.find(
        b => b.type === "SCRATCHPAD",
      );
      const maliciousScratchpadValue = extractOracleValueAnswerFromBlock(
        maliciousScratchpadBlock,
      );

      const idOfPointerInMaliciousScratchpad = _.get(
        maliciousScratchpadBlock,
        "value[0].nodes[1].data.pointerId",
      );
      const isSamePointerInMaliciousScratchpadAndHonestAnswerDraft =
        idOfPointerInMaliciousScratchpad === idOfPointerInHonestAnswerDraft;

      const didMaliciousWin =
        isHonestOracleCurrentlyResolved &&
        isSamePointerInMaliciousScratchpadAndHonestAnswerDraft;

      const normal = malicious.childWorkspaces[0];

      const didMaliciousDeclineToChallenge = didHonestWin && !normal;

      return (
        <CompactTreeGroup
          availablePointers={this.props.availablePointers}
          didHonestWin={didHonestWin}
          didMaliciousWin={didMaliciousWin}
          didMaliciousDeclineToChallenge={didMaliciousDeclineToChallenge}
          hasLoaded={true}
          honestAnswerBlockId={honestScratchpadBlock.id}
          honestAnswerValue={honestScratchpadValue}
          isExpanded={this.props.isExpanded}
          isRequestingLazyUnlock={workspace.isRequestingLazyUnlock}
          isWorkspaceNormal={isWorkspaceNormal}
          malicious={malicious}
          maliciousAnswerBlockId={maliciousScratchpadBlock.id}
          maliciousAnswerValue={maliciousScratchpadValue}
          normal={normal}
          oracleBypassAnswerBlockId={answerDraftBlock.id}
          oracleBypassAnswerValue={answerDraftValue}
          questionBlockId={honestQuestionBlock.id}
          questionValue={questionValue}
          workspace={workspace}
        />
      );
    }
  }
}

export const GROUP_QUERY = gql`
  query groupQuery($workspaceId: String!) {
    workspace(id: $workspaceId) {
      id
      createdAt
      parentId
      isArchived
      isCurrentlyResolved
      isEligibleForHonestOracle
      isEligibleForMaliciousOracle
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

export const CompactTreeGroupContainer: any = compose(
  graphql(GROUP_QUERY, {
    name: "groupQuery",
    options: (props: any) => ({
      variables: {
        workspaceId: props.workspaceId,
      },
    }),
  }),
)(CompactTreeGroupContainerBase);
