import styled from "styled-components";
import * as React from "react";
import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";
import Plain from "slate-plain-serializer";
import { Value } from "slate";
import { Link } from "react-router-dom";

const BlockBullet = styled(Link)`
  float: left;
  border-radius: 2px;
  color: #d0cccc;
  padding: 0px 4px;
  margin: 4px 4px 4px 9px;
  font-weight: 500;
  flex: 1;
  &:hover {
    background: #ccc;
    text-decoration: none;
  }
`;

const BlockContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const BlockEditorContainer = styled.div`
  float: left;
  flex: 40;
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
      <BlockBullet to={`/workspaces/${workspace.id}`}>{character}</BlockBullet>
      <BlockEditorContainer>
        <BlockEditor
          name={block.id}
          blockId={block.id}
          readOnly={true}
          isDisplayMode={true}
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
