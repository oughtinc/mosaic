import * as _ from "lodash";
import * as React from "react";

import HyperText from "./HyperText";
import {
  HyperTextObject as HyperTextObjectT,
  HyperTextValue
} from "../../data/types";

interface WorkspaceProps {
  question: HyperTextValue;
  answer: HyperTextValue;
}

const Workspace: React.SFC<WorkspaceProps> = ({ question, answer }) => {
  // TODO: move elsewhere
  return (
    <div
      className="Workspace"
      style={{ border: "1px solid #ccc", padding: ".5em" }}
    >
      <div className="Workspace-Question">
        <div>Question:</div>
        <HyperText value={question} />
      </div>
      <div className="Workspace-Answer">
        <div>Answer:</div>
        <HyperText value={answer} />
      </div>
    </div>
  );
};

const templates = {
  workspace: Workspace
};

function isTemplatedObject(object: HyperTextObjectT) {
  return (
    _.has(object, "template") && _.has(templates, object.template as string)
  );
}

interface HyperTextObjectProps {
  value: HyperTextObjectT;
}

const HyperTextObject: React.SFC<HyperTextObjectProps> = ({ value }) => {
  if (isTemplatedObject(value)) {
    const Component = templates[value.template as string];
    return <Component {...value} />;
  }
  return (
    <div className="HyperText HyperText-Object">
      <div>Unrecognized hypertext object type:</div>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export default HyperTextObject;
