import * as _ from "lodash";
import { databaseJSONToValue } from "../../../lib/slateParser";

export function extractOracleValueAnswerFromBlock(block) {
  const pointerNodes = _.get(block, "value[0].nodes[1].nodes");
  if (!pointerNodes) {
    return databaseJSONToValue(block.value);
  }

  return databaseJSONToValue([{
    object: "block",
    nodes: block.value[0].nodes[1].nodes,
    type: "line",
  }]);
}