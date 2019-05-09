import * as React from "react";

import { MaliciousAnswer } from "./MaliciousAnswer";

export class MaliciousAnswerIfMaliciousWon extends React.PureComponent<
  any,
  any
> {
  public render() {
    return (
      <MaliciousAnswer
        availablePointers={this.props.availablePointers}
        didHonestWin={false}
        didMaliciousWin={true}
        didMaliciousDeclineToChallenge={false}
        malicious={this.props.malicious}
        maliciousAnswerBlockId={this.props.maliciousAnswerBlockId}
        maliciousAnswerValue={this.props.maliciousAnswerValue}
        normal={this.props.normal}
      />
    );
  }
}
