import * as React from "react";
import { Link } from "react-router-dom";

import { CompactTreeRow } from "./CompactTreeRow";
import { CompactTreeRowLabel } from "./CompactTreeRowLabel";
import { CompactTreeRowContent } from "./CompactTreeRowContent";

import { BlockEditor } from "../../components/BlockEditor";

const Checkmark = ({ color }) => (
  <span style={{ color, fontSize: "24px" }}>✓</span>
);

export class MaliciousAnswer extends React.PureComponent<any, any> {
  public render() {
    const {
      availablePointers,
      didMaliciousWin,
      didMaliciousDeclineToChallenge,
      malicious,
      maliciousAnswerBlockId,
      maliciousAnswerValue,
      normal,
    } = this.props;

    return (
      <CompactTreeRow>
        <CompactTreeRowLabel>
          {didMaliciousWin && (
            <Link
              style={{ textDecoration: "none" }}
              target="_blank"
              to={`/workspaces/${normal.id}`}
            >
              <Checkmark color="red" />
            </Link>
          )}{" "}
          <Link
            style={{
              color: "red",
              textDecoration: "none",
            }}
            target="_blank"
            to={`/workspaces/${malicious.id}`}
          >
            M
          </Link>
        </CompactTreeRowLabel>
        {didMaliciousDeclineToChallenge ? (
          <span style={{ color: "red" }}>No challenge</span>
        ) : normal ? (
          <CompactTreeRowContent>
            <BlockEditor
              name={maliciousAnswerBlockId}
              blockId={maliciousAnswerBlockId}
              readOnly={true}
              initialValue={maliciousAnswerValue}
              shouldAutosave={false}
              availablePointers={availablePointers}
            />
          </CompactTreeRowContent>
        ) : (
          <span style={{ color: "#999" }}>Waiting for response</span>
        )}
      </CompactTreeRow>
    );
  }
}
