import * as React from "react";

import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";

export class LazyUnlockGroup extends React.PureComponent<any, any> {
    public render() {
      const { workspace } = this.props;

      const oracleQuestionBlock = workspace.blocks.find(b => b.type === "QUESTION");
      const questionValue = databaseJSONToValue(oracleQuestionBlock.value);

      const oracleAnswerDraftBlock = workspace.blocks.find(b => b.type === "ANSWER_DRAFT");
      const oracleAnswerDraftValue = databaseJSONToValue(oracleAnswerDraftBlock.value);

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
              Unlock
            </div>
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                padding: "5px",
              }}
            >
              <BlockEditor
                name={oracleQuestionBlock.id}
                blockId={oracleQuestionBlock.id}
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
              🔓 Content
            </div>
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                padding: "5px",
              }}
            >
              <BlockEditor
                name={oracleAnswerDraftBlock.id}
                blockId={oracleAnswerDraftBlock.id}
                readOnly={true}
                initialValue={oracleAnswerDraftValue}
                shouldAutosave={false}
                availablePointers={this.props.availablePointers}
              />
            </div>
          </div>
        </div>
      );
    }
  }