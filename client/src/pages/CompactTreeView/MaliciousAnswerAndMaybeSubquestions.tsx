import * as React from "react";

import { MaliciousAnswer } from "./MaliciousAnswer";
import { Subquestions } from "./Subquestions";

export class MaliciousAnswerAndMaybeSubquestions extends React.PureComponent<
  any,
  any
> {
  public render() {
    const {
      availablePointers,
      didHonestWin,
      didMaliciousDeclineToChallenge,
      didMaliciousWin,
      malicious,
      maliciousAnswerBlockId,
      maliciousAnswerValue,
      normal,
      isAwaitingHonestDecision,
    } = this.props;

    return (
      <div>
        <MaliciousAnswer
          availablePointers={availablePointers}
          didHonestWin={didHonestWin}
          didMaliciousDeclineToChallenge={didMaliciousDeclineToChallenge}
          didMaliciousWin={didMaliciousWin}
          malicious={malicious}
          maliciousAnswerBlockId={maliciousAnswerBlockId}
          maliciousAnswerValue={maliciousAnswerValue}
          normal={normal}
          didHonestDecideToConcede={this.props.didHonestDecideToConcede}
        />
        {isAwaitingHonestDecision && (
          <div style={{ color: "#777" }}>Waiting for honest decision</div>
        )}
        {!didMaliciousDeclineToChallenge &&
          normal &&
          normal.childWorkspaces.length > 0 && (
            <Subquestions
              availablePointers={availablePointers}
              subquestions={normal.childWorkspaces}
            />
          )}
      </div>
    );
  }
}
