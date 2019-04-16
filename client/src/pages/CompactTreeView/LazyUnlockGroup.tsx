import * as React from "react";

import { CompactTreeRow } from "./CompactTreeRow";
import { CompactTreeRowLabel } from "./CompactTreeRowLabel";
import { CompactTreeRowContent } from "./CompactTreeRowContent";

import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";

export class LazyUnlockGroup extends React.PureComponent<any, any> {
    public render() {
      const {
        availablePointers,
        isExpanded,
        workspace,
      } = this.props;

      const oracleQuestionBlock = workspace.blocks.find(b => b.type === "QUESTION");
      const questionValue = databaseJSONToValue(oracleQuestionBlock.value);

      const oracleAnswerDraftBlock = workspace.blocks.find(b => b.type === "ANSWER_DRAFT");
      const isOracleAnswerDraftBlockValueNull = oracleAnswerDraftBlock.value === null;
      const oracleAnswerDraftValue = databaseJSONToValue(oracleAnswerDraftBlock.value);

      return (
        <div>
          <CompactTreeRow>
            <CompactTreeRowLabel>
              Unlock
            </CompactTreeRowLabel>
            <CompactTreeRowContent>
              <BlockEditor
                name={oracleQuestionBlock.id}
                blockId={oracleQuestionBlock.id}
                readOnly={true}
                initialValue={questionValue}
                shouldAutosave={false}
                availablePointers={availablePointers}
              />
            </CompactTreeRowContent>
          </CompactTreeRow>
          {
            (isExpanded || !isOracleAnswerDraftBlockValueNull)
            &&
            <CompactTreeRow>
              <CompactTreeRowLabel>
                🔓 {workspace.isEligibleForHonestOracle ? "Honest" : "Malicious"}
              </CompactTreeRowLabel>
                {
                  isOracleAnswerDraftBlockValueNull
                  ?
                  <span style={{ color: "#999" }}>Waiting for response</span>
                  :
                  <CompactTreeRowContent>
                    <BlockEditor
                      name={oracleAnswerDraftBlock.id}
                      blockId={oracleAnswerDraftBlock.id}
                      readOnly={true}
                      initialValue={oracleAnswerDraftValue}
                      shouldAutosave={false}
                      availablePointers={availablePointers}
                    />
                  </CompactTreeRowContent>
                }
            </CompactTreeRow>
          }
        </div>
      );
    }
  }