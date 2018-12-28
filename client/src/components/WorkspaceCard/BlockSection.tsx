import styled from "styled-components";
import * as React from "react";
import { BlockBulletLink } from "./BlockBullet";
import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";
import Plain from "slate-plain-serializer";
import { Value } from "slate";

const BlockContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

// Setting min-width enables wrapping behavior.
const BlockEditorContainer = styled.div`
  margin: 4px 9px 4px 0;
  float: left;
  flex: 40;
  min-width: 1px;
`;

const BlockSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Block = ({ character, block, availablePointers, workspace }) => {
  if (!block.value) {
    return <div />;
  }
  const value = databaseJSONToValue(block.value);
  const serializedValue = Plain.serialize(Value.fromJSON(value));
  if (!serializedValue) {
    return <div />;
  }
  return (
    <BlockContainer>
      <BlockBulletLink to={`/workspaces/${workspace.id}`}>{character}</BlockBulletLink>
      <BlockEditorContainer>
        <BlockEditor
          name={block.id}
          blockId={block.id}
          readOnly={true}
          initialValue={value}
          shouldAutosave={false}
          availablePointers={availablePointers}
        />
      </BlockEditorContainer>
    </BlockContainer>
  );
};

export const BlockSection = ({ workspace, availablePointers }) => {
  const question = workspace.blocks.find(b => b.type === "QUESTION");
  const scratchpad = workspace.blocks.find(b => b.type === "SCRATCHPAD");
  const answer = workspace.blocks.find(b => b.type === "ANSWER");
  return (
    <div style={{ display: "flexbox" }}>
      <BlockSectionContainer>
        <Block
          block={question}
          character={"Q"}
          availablePointers={availablePointers}
          workspace={workspace}
        />
        <Block
          block={scratchpad}
          character={"S"}
          availablePointers={availablePointers}
          workspace={workspace}
        />
        <Block
          block={answer}
          character={"A"}
          availablePointers={availablePointers}
          workspace={workspace}
        />
      </BlockSectionContainer>
    </div>
  );
};
