import * as React from "react";

import { MaliciousAnswer } from "./MaliciousAnswer";
import { Subquestions } from "./Subquestions";

export class MaliciousAnswerAndMaybeSubquestions extends React.PureComponent<any, any> {
  public render() {
    const {
      availablePointers,
      didHonestWin,
      idOfPointerInHonestAnswerDraft,
      isHonestOracleCurrentlyResolved,
      malicious,
    } = this.props;

    const normal = malicious.childWorkspaces[0];
    const didMaliciousDeclineToChallenge = didHonestWin && !normal;

    return (
      <div>
        <MaliciousAnswer
          availablePointers={this.props.availablePointers}
          didHonestWin={didHonestWin}
          idOfPointerInHonestAnswerDraft={idOfPointerInHonestAnswerDraft}
          isHonestOracleCurrentlyResolved={isHonestOracleCurrentlyResolved}
          malicious={malicious}
        />
        {
          !didMaliciousDeclineToChallenge
          &&
          normal
          &&
          normal.childWorkspaces.length > 0
          &&
          <Subquestions
            availablePointers={availablePointers}
            subquestions={normal.childWorkspaces}
          />
        }
      </div>
    );
  }
}