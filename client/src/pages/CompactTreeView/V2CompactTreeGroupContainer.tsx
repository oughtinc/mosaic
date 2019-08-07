import * as _ from "lodash";
import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { CompactTreeGroup } from "./CompactTreeGroup";
import { databaseJSONToValue } from "../../lib/slateParser";

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

      const questionBlock = workspace.blocks.find(b => b.type === "QUESTION");

      const questionValue = databaseJSONToValue(questionBlock.value);

      const answerDraftBlock = workspace.blocks.find(
        b => b.type === "ANSWER_DRAFT",
      );

      const answerDraftValue = databaseJSONToValue(answerDraftBlock.value);

      if (isWorkspaceNormal) {
        return (
          <CompactTreeGroup
            availablePointers={this.props.availablePointers}
            hasLoaded={true}
            isExpanded={this.props.isExpanded}
            isRequestingLazyUnlock={workspace.isRequestingLazyUnlock}
            isWorkspaceNormal={isWorkspaceNormal}
            oracleBypassAnswerBlockId={answerDraftBlock.id}
            oracleBypassAnswerValue={answerDraftValue}
            questionBlockId={questionBlock.id}
            questionValue={questionValue}
            workspace={workspace}
          />
        );
      }

      const honestAnswerCandidateBlock = workspace.blocks.find(
        b => b.type === "ORACLE_ANSWER_CANDIDATE",
      );

      const honestAnswerCandidateValue = databaseJSONToValue(
        honestAnswerCandidateBlock.value,
      );

      const honestAnswerDraftBlock = workspace.blocks.find(
        b => b.type === "ANSWER_DRAFT",
      );

      const malicious = workspace.childWorkspaces[0];

      if (!malicious) {
        return (
          <CompactTreeGroup
            availablePointers={this.props.availablePointers}
            hasLoaded={true}
            honestAnswerBlockId={honestAnswerCandidateBlock.id}
            honestAnswerValue={honestAnswerCandidateValue}
            isExpanded={this.props.isExpanded}
            isRequestingLazyUnlock={workspace.isRequestingLazyUnlock}
            isWorkspaceNormal={isWorkspaceNormal}
            malicious={malicious}
            oracleBypassAnswerBlockId={answerDraftBlock.id}
            oracleBypassAnswerValue={answerDraftValue}
            questionBlockId={questionBlock.id}
            questionValue={questionValue}
            workspace={workspace}
          />
        );
      }

      const idOfPointerInHonestAnswerDraft = _.get(
        honestAnswerDraftBlock,
        "value[0].nodes[1].data.pointerId",
      );

      const maliciousQuestionBlock = malicious.blocks.find(
        b => b.type === "QUESTION",
      );

      const idOf2ndPointerInMaliciousQuestion = _.get(
        maliciousQuestionBlock,
        "value[0].nodes[3].data.pointerId",
      );

      const isSamePointerInHonestAnswerDraftAndMaliciousQuestion =
        idOfPointerInHonestAnswerDraft === idOf2ndPointerInMaliciousQuestion;

      const isHonestOracleCurrentlyResolved = workspace.isCurrentlyResolved;

      const normal = malicious.childWorkspaces[0];

      const didMaliciousDeclineToChallenge =
        isHonestOracleCurrentlyResolved && !normal;

      const isAwaitingHonestDecision =
        normal && normal.isAwaitingHonestExpertDecision;

      const didHonestDecideToConcede =
        normal && normal.isEligibleForHonestOracle && !isAwaitingHonestDecision;

      const didHonestDecideToPlayOut =
        normal &&
        !normal.isEligibleForHonestOracle &&
        !isAwaitingHonestDecision;

      const didHonestWin =
        didMaliciousDeclineToChallenge || // this is here b/c in some older trees the follow disjunct is false in cases where the malicious oracle declines
        (didHonestDecideToPlayOut &&
          isHonestOracleCurrentlyResolved &&
          isSamePointerInHonestAnswerDraftAndMaliciousQuestion);

      const didMaliciousWin =
        (!didHonestWin && // this is here b/c in some older trees the follow two conjuncts are true in cases where the malicious oracle declines
          isHonestOracleCurrentlyResolved &&
          !isSamePointerInHonestAnswerDraftAndMaliciousQuestion) ||
        didHonestDecideToConcede;

      const maliciousAnswerCandidateBlock = malicious.blocks.find(
        b => b.type === "ORACLE_ANSWER_CANDIDATE",
      );

      const maliciousAnswerCandidateValue =
        maliciousAnswerCandidateBlock &&
        databaseJSONToValue(maliciousAnswerCandidateBlock.value);

      return (
        <CompactTreeGroup
          availablePointers={this.props.availablePointers}
          didHonestWin={didHonestWin}
          didMaliciousWin={didMaliciousWin}
          didMaliciousDeclineToChallenge={didMaliciousDeclineToChallenge}
          hasLoaded={true}
          honestAnswerBlockId={honestAnswerCandidateBlock.id}
          honestAnswerValue={honestAnswerCandidateValue}
          isExpanded={this.props.isExpanded}
          isRequestingLazyUnlock={workspace.isRequestingLazyUnlock}
          isWorkspaceNormal={isWorkspaceNormal}
          malicious={malicious}
          maliciousAnswerBlockId={
            maliciousAnswerCandidateBlock && maliciousAnswerCandidateBlock.id
          }
          maliciousAnswerValue={maliciousAnswerCandidateValue}
          normal={normal}
          oracleBypassAnswerBlockId={answerDraftBlock.id}
          oracleBypassAnswerValue={answerDraftValue}
          questionBlockId={questionBlock.id}
          questionValue={questionValue}
          workspace={workspace}
          isAwaitingHonestDecision={isAwaitingHonestDecision}
          didHonestDecideToConcede={didHonestDecideToConcede}
          didHonestDecideToPlayOut={didHonestDecideToPlayOut}
        />
      );
    }
  }
}

export const GROUP_QUERY = gql`
  query groupQuery($workspaceId: String!) {
    workspace(id: $workspaceId) {
      id
      serialId
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
          isEligibleForHonestOracle
          isAwaitingHonestExpertDecision
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
