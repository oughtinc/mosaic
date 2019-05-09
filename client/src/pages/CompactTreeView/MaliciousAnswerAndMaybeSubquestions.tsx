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
        />
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
