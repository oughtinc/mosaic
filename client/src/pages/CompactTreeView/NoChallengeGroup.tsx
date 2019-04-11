import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { LazyUnlockGroup } from "./LazyUnlockGroup";

import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";

export class NoChallengeGroup extends React.PureComponent<any, any> {
    public render() {
      const { workspace } = this.props;

      if (workspace.isRequestingLazyUnlock) {
        return <LazyUnlockGroup workspace={workspace} />;
      }

      const honestQuestionBlock = workspace.blocks.find(b => b.type === "QUESTION");
      const questionValue = databaseJSONToValue(honestQuestionBlock.value);

      const honestAnswerDraftBlock = workspace.blocks.find(b => b.type === "ANSWER_DRAFT");
      const honestAnswerDraftValue = databaseJSONToValue(honestAnswerDraftBlock.value);

      return (
        <div>
          No Challenge
          <BlockEditor
            name={honestQuestionBlock.id}
            blockId={honestQuestionBlock.id}
            readOnly={true}
            initialValue={questionValue}
            shouldAutosave={false}
            availablePointers={workspace.connectedPointersOfSubtree}
          />
          Honest Answer
          <BlockEditor
            name={honestAnswerDraftBlock.id}
            blockId={honestAnswerDraftBlock.id}
            readOnly={true}
            initialValue={honestAnswerDraftValue}
            shouldAutosave={false}
            availablePointers={workspace.connectedPointersOfSubtree}
          />
        </div>
      );
    }
  }