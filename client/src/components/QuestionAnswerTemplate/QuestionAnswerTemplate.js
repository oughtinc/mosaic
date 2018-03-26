import * as React from "react";

import Store from "../../store";
import HyperText from "../HyperText/HyperText";
import {
  HyperTextObject as HyperTextObjectT,
  HyperTextValue,
  RenderNode
} from "../../data/types";

interface QuestionAnswerTemplateProps {
  question: HyperTextValue;
  answer: HyperTextValue;
  store: Store;
  renderNode: RenderNode;
}

const QuestionAnswerTemplate: React.SFC<QuestionAnswerTemplateProps> = ({
  question,
  answer,
  store,
  renderNode
}) => {
  return (
    <div
      className="QuestionAnswerTemplate"
      style={{ border: "1px solid #ccc", padding: ".5em" }}
    >
      <div className="QuestionAnswerTemplate-Question">
        <div>Question:</div>
        <HyperText value={question} store={store} renderNode={renderNode} />
      </div>
      <div className="QuestionAnswerTemplate-Answer">
        <div>Answer:</div>
        <HyperText value={answer} store={store} renderNode={renderNode} />
      </div>
    </div>
  );
};

export default QuestionAnswerTemplate;
