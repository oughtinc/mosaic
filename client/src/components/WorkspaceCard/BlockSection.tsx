import styled from "styled-components";
import * as React from "react";
import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";
import { toggleTypes } from "./index";

const BlockBullet = styled.a`
    float: left;
    border-radius: 2px;
    color: #d0cccc;
    padding: 0px 4px;
    margin: 4px 4px 4px 9px;
    font-weight: 500;
`;

const BlockContainer = styled.div`
    flex: 1;
`;

const BlockEditorContainer = styled.div`
    float: left;
`;

const BlockSectionContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const Block = ({ character, block, availablePointers, toggle }) => {
    if (!!block.value) {
        return (
            <BlockContainer>
                <BlockBullet href="#!">
                    {character}
                </BlockBullet>
                {toggle &&
                    <BlockEditorContainer>
                        <BlockEditor
                            name={block.id}
                            blockId={block.id}
                            readOnly={true}
                            initialValue={databaseJSONToValue(block.value)}
                            shouldAutosave={false}
                            availablePointers={availablePointers}
                        />
                    </BlockEditorContainer>
                }
            </BlockContainer>
        );
    } else {
        return (<div />);
    }
};

export const BlockSection = ({ workspace, availablePointers, toggles }) => {
    const question = workspace.blocks.find((b) => b.type === "QUESTION");
    const scratchpad = workspace.blocks.find((b) => b.type === "SCRATCHPAD");
    const answer = workspace.blocks.find((b) => b.type === "ANSWER");
    return (
        <div style={{ display: "flexbox" }}>
            <BlockSectionContainer>
                <Block block={question} character={"Q"} availablePointers={availablePointers} toggle={toggles[toggleTypes.QUESTION]} />
                <Block block={scratchpad} character={"S"} availablePointers={availablePointers} toggle={toggles[toggleTypes.SCRATCHPAD]} />
                <Block block={answer} character={"A"} availablePointers={availablePointers} toggle={toggles[toggleTypes.ANSWER]} />
            </BlockSectionContainer>
        </div>
    );
};