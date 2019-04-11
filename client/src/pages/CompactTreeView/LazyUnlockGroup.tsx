import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";

export class LazyUnlockGroup extends React.PureComponent<any, any> {
    public render() {
      const { workspace } = this.props;

      const oracleQuestionBlock = workspace.blocks.find(b => b.type === "QUESTION");
      const questionValue = databaseJSONToValue(oracleQuestionBlock.value);

      const oracleAnswerDraftBlock = workspace.blocks.find(b => b.type === "ANSWER_DRAFT");
      const oracleAnswerDraftValue = databaseJSONToValue(oracleAnswerDraftBlock.value);

      const isHonestOracleCurrentlyResolved = workspace.isCurrentlyResolved;

      return (
        <div>
          <strong>Pointer Unlock</strong>
          <BlockEditor
            name={oracleQuestionBlock.id}
            blockId={oracleQuestionBlock.id}
            readOnly={true}
            initialValue={questionValue}
            shouldAutosave={false}
            availablePointers={workspace.connectedPointersOfSubtree}
          />
          Answer ({ isHonestOracleCurrentlyResolved ? "Submitted" : "In Progress"})
          <BlockEditor
            name={oracleAnswerDraftBlock.id}
            blockId={oracleAnswerDraftBlock.id}
            readOnly={true}
            initialValue={oracleAnswerDraftValue}
            shouldAutosave={false}
            availablePointers={workspace.connectedPointersOfSubtree}
          />
        </div>
      );
    }
  }