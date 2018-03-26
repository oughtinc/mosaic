import * as _ from "lodash";
import * as React from "react";

import Store from "../../store";
import QuestionAnswerTemplate from "../QuestionAnswerTemplate/QuestionAnswerTemplate";
import {
  HyperTextObject as HyperTextObjectT,
  RenderNode
} from "../../data/types";

const templates = {
  "question-answer": QuestionAnswerTemplate
};

function isTemplatedObject(object: HyperTextObjectT) {
  return (
    _.has(object, "template") && _.has(templates, object.template as string)
  );
}

interface HyperTextObjectProps {
  value: HyperTextObjectT;
  store: Store;
  renderNode: RenderNode;
}

const HyperTextObject: React.SFC<HyperTextObjectProps> = ({
  value,
  store,
  renderNode
}) => {
  if (isTemplatedObject(value)) {
    const Component = templates[value.template as string];
    return <Component {...value} renderNode={renderNode} store={store} />;
  }
  return (
    <div className="HyperText HyperText-Object">
      <div>Unrecognized hypertext object type:</div>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export default HyperTextObject;
