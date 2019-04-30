import * as _ from "lodash";
import * as React from "react";

import { MaliciousAnswer } from "./MaliciousAnswer";

export class MaliciousAnswerIfMaliciousWon extends React.PureComponent<
  any,
  any
> {
  public render() {
    const {
      availablePointers,
      didHonestWin,
      idOfPointerInHonestAnswerDraft,
      isHonestOracleCurrentlyResolved,
      malicious,
    } = this.props;

    const maliciousScratchpadBlock = malicious.blocks.find(
      b => b.type === "SCRATCHPAD",
    );
    const idOfPointerInMaliciousScratchpad = _.get(
      maliciousScratchpadBlock,
      "value[0].nodes[1].data.pointerId",
    );
    const isSamePointerInMaliciousScratchpadAndHonestAnswerDraft =
      idOfPointerInMaliciousScratchpad === idOfPointerInHonestAnswerDraft;
    const didMaliciousWin =
      isHonestOracleCurrentlyResolved &&
      isSamePointerInMaliciousScratchpadAndHonestAnswerDraft;

    return didMaliciousWin ? (
      <MaliciousAnswer
        availablePointers={availablePointers}
        didHonestWin={didHonestWin}
        idOfPointerInHonestAnswerDraft={idOfPointerInHonestAnswerDraft}
        isHonestOracleCurrentlyResolved={isHonestOracleCurrentlyResolved}
        malicious={malicious}
      />
    ) : null;
  }
}
