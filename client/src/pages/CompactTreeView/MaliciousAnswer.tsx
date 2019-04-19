import * as _ from "lodash";
import * as React from "react";
import { Link } from "react-router-dom";

import { CompactTreeRow } from "./CompactTreeRow";
import { CompactTreeRowLabel } from "./CompactTreeRowLabel";
import { CompactTreeRowContent } from "./CompactTreeRowContent";

import { BlockEditor } from "../../components/BlockEditor";

import { extractOracleValueAnswerFromBlock } from "./helpers/extractOracleAnswerValueFromBlock";

const Checkmark = ({ color }) => <span style={{ color, fontSize: "24px" }}>✓</span>;

export class MaliciousAnswer extends React.PureComponent<any, any> {
  public render() {
    const {
      availablePointers,
      didHonestWin,
      idOfPointerInHonestAnswerDraft,
      isHonestOracleCurrentlyResolved,
      malicious,
    } = this.props;

    const maliciousScratchpadBlock = malicious.blocks.find(b => b.type === "SCRATCHPAD");
    const maliciousScratchpadValue = extractOracleValueAnswerFromBlock(maliciousScratchpadBlock);

    const idOfPointerInMaliciousScratchpad = _.get(maliciousScratchpadBlock, "value[0].nodes[1].data.pointerId");
    const isSamePointerInMaliciousScratchpadAndHonestAnswerDraft = idOfPointerInMaliciousScratchpad === idOfPointerInHonestAnswerDraft;
    const didMaliciousWin = isHonestOracleCurrentlyResolved && isSamePointerInMaliciousScratchpadAndHonestAnswerDraft;

    const normal = malicious.childWorkspaces[0];
    const didMaliciousDeclineToChallenge = didHonestWin && !normal;

    return (
      <CompactTreeRow>
        <CompactTreeRowLabel>
          {
            didMaliciousWin
            &&
            <Link
              style={{ textDecoration: "none" }}
              target="_blank"
              to={`/workspaces/${normal.id}`}
            >
              <Checkmark color="red" />
            </Link>
          }
          {" "}
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
        {
          didMaliciousDeclineToChallenge
          ?
          <span style={{ color: "red"}}>No challenge</span>
          :
          (
            normal
            ?
            <CompactTreeRowContent>
              <BlockEditor
                name={maliciousScratchpadBlock.id}
                blockId={maliciousScratchpadBlock.id}
                readOnly={true}
                initialValue={maliciousScratchpadValue}
                shouldAutosave={false}
                availablePointers={availablePointers}
              />
            </CompactTreeRowContent>
            :
            <span style={{ color: "#999" }}>Waiting for response</span>
          )
        }
      </CompactTreeRow>
    );
  }
}