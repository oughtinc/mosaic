import * as React from "react";
import { Link } from "react-router-dom";

import { CompactTreeRow } from "./CompactTreeRow";
import { CompactTreeRowLabel } from "./CompactTreeRowLabel";
import { CompactTreeRowContent } from "./CompactTreeRowContent";
import { Subquestions } from "./Subquestions";

import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";

const Checkmark = ({ color }) => (
  <span style={{ color, fontSize: "24px" }}>✓</span>
);

export class NormalWorkspaceGroup extends React.PureComponent<any, any> {
  public render() {
    const {
      availablePointers,
      isExpanded,
      isThisActiveWorkspace,
      workspace,
    } = this.props;

    const questionBlock = workspace.blocks.find(b => b.type === "QUESTION");
    const questionValue = databaseJSONToValue(questionBlock.value);

    const answerDraftBlock = workspace.blocks.find(
      b => b.type === "ANSWER_DRAFT",
    );
    const isCurrentlyResolved = workspace.isCurrentlyResolved;
    const answerDraftValue = databaseJSONToValue(answerDraftBlock.value);

    const subquestions = workspace.childWorkspaces;

    return (
      <div>
        <CompactTreeRow>
          <Link
            style={{
              color: "#333",
              textDecoration: "none",
            }}
            target="_blank"
            to={`/workspaces/${workspace.parentId}`}
          >
            <CompactTreeRowLabel>Q</CompactTreeRowLabel>
          </Link>
          <CompactTreeRowContent
            style={{
              boxShadow: isThisActiveWorkspace && "0 0 0 5px yellow",
            }}
          >
            <BlockEditor
              name={questionBlock.id}
              blockId={questionBlock.id}
              readOnly={true}
              initialValue={questionValue}
              shouldAutosave={false}
              availablePointers={availablePointers}
            />
          </CompactTreeRowContent>
        </CompactTreeRow>
        {(isExpanded || isCurrentlyResolved) && (
          <div>
            <CompactTreeRow>
              <Link
                style={{ textDecoration: "none" }}
                target="_blank"
                to={`/workspaces/${workspace.id}`}
              >
                <CompactTreeRowLabel color="blue">
                  {isCurrentlyResolved && <Checkmark color="blue" />}
                  {isCurrentlyResolved && " "}A
                </CompactTreeRowLabel>
              </Link>
              {!isCurrentlyResolved ? (
                <span style={{ color: "#999" }}>Waiting for response</span>
              ) : (
                <CompactTreeRowContent>
                  <BlockEditor
                    name={answerDraftValue.id}
                    blockId={answerDraftValue.id}
                    readOnly={true}
                    initialValue={answerDraftValue}
                    shouldAutosave={false}
                    availablePointers={availablePointers}
                  />
                </CompactTreeRowContent>
              )}
            </CompactTreeRow>
            {isExpanded && (
              <Subquestions
                availablePointers={availablePointers}
                subquestions={subquestions}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}
