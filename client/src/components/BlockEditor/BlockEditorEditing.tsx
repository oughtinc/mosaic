import * as React from "react";
import styled from "styled-components";
import { Inline } from "slate";
import * as uuidv1 from "uuid/v1";
import { Editor } from "slate-react";
import { compose, withProps, withState } from "recompose";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import { updateBlock } from "../../modules/blocks/actions";
import { MenuBar } from "./MenuBar";
import { MutationStatus } from "./types";
import { valueToDatabaseJSON } from "../../lib/slateParser";
import { exportSelection } from "../../modules/blockEditor/actions";
import * as _ from "lodash";

const BlockEditorStyle = styled.div`
    background: #f4f4f4;
    border-radius: 2px;
    border: 1px solid #d5d5d5;
    margin-bottom: 1em;
    padding: .3em;
`;

const UPDATE_BLOCKS = gql`
    mutation updateBlocks($blocks:[blockInput]){
        updateBlocks(blocks:$blocks){
            id
            value
            updatedAtEventId
        }
    }
`;

const AUTOSAVE_EVERY_N_SECONDS = 3;
const DOLLAR_NUMBER_SPACE = /\$[0-9]+\s/;

function lastCharactersAfterEvent(event: any, n: any) {
    const { anchorOffset, focusNode: wholeText }: any = window.getSelection();
    if (!wholeText) { return ""; }
    const text: string = wholeText.textContent.slice(Math.max(anchorOffset - n + 1, 0), anchorOffset);
    const key: string = event.key;
    return text + key;
}

function inlinePointerImportJSON(pointerId: string) {
    return Inline.fromJSON({
        object: "inline",
        type: "pointerImport",
        isVoid: true,
        data: {
            pointerId: pointerId,
            internalReferenceId: uuidv1(),
        },
    });
}

// Eventually we'll type out many of these items more spefically, but that's a future refactor.
interface BlockEditorEditingPresentationalProps {
    block: any;
    availablePointers: any[];
    value: any;
    mutationStatus: any;
    blockEditor: any;
    plugins: any[];
    shouldAutosave: boolean;
    onMount(value: any): () => {};
    updateBlock(value: any): () => {};
    onChange(value: any): () => boolean;
    saveBlocksMutation(): () => {};
    exportSelection(): () => {};
    onKeyDown(event: any): () => {};
}

interface BlockEditorEditingPresentationalState {
    hasChangedSinceDatabaseSave: boolean;
}
export class BlockEditorEditingPresentational extends React.Component<BlockEditorEditingPresentationalProps, BlockEditorEditingPresentationalState> {
    public editor;
    private autosaveInterval: any;

    public constructor(props: any) {
        super(props);
        this.state = { hasChangedSinceDatabaseSave: false };
    }

    // public shouldComponentUpdate(newProps: any) {
    //     if (
    //         !_.isEqual(newProps.blockEditor, this.props.blockEditor)
    //         || !_.isEqual(newProps.availablePointers, this.props.availablePointers)
    //         || !_.isEqual(newProps.block, this.props.block)
    //     ) {
    //         return true;
    //     }
    //     return false;
    // }

    public componentWillMount() {
        this.props.onMount(this);
    }

    public componentWillUnmount() {
        this.considerSaveToDatabase();
        this.endAutosaveInterval();
    }

    public componentDidUpdate(prevProps: any) {
        const oldDocument = prevProps.block.value.document;
        const newDocument = this.props.block.value.document;

        if (!oldDocument.equals(newDocument)) {
            this.onValueChange();
        }
    }

    public render() {
        return (
            <BlockEditorStyle>
                <MenuBar
                    blockEditor={this.props.blockEditor}
                    onAddPointerImport={this.onAddPointerImport}
                    availablePointers={this.props.availablePointers}
                    mutationStatus={this.props.mutationStatus}
                    hasChangedSinceDatabaseSave={this.state.hasChangedSinceDatabaseSave}
                />
                <Editor
                    value={this.props.value}
                    onChange={(c) => this.onChange(c.value)}
                    plugins={this.props.plugins}
                    spellCheck={false}
                    onBlur={this.handleBlur}
                    onKeyDown={this.onKeyDown}
                    ref={(input) => { this.editor = input; }}
                />
            </BlockEditorStyle>
        );
    }

    private checkAutocomplete = (event) => {
        const lastCharacters = lastCharactersAfterEvent(event, 4);
        const pointerNameMatch = lastCharacters.match(DOLLAR_NUMBER_SPACE);
        if (pointerNameMatch) {
            this.handlePointerNameAutocomplete(lastCharacters, pointerNameMatch, event);
        }
    }

    private handlePointerNameAutocomplete = (characters, match, event) => {
        const matchNumber = Number(match[0].substring(1, match[0].length - 1));
        const pointer = this.props.availablePointers[matchNumber - 1];

        if (!!pointer) {
            const { value } = this.props.value.change()
                .deleteBackward(matchNumber.toString().length + 1)
                .insertInline(inlinePointerImportJSON(pointer.data.pointerId))
                .collapseToStartOfNextText()
                .focus()
                .insertText(" ");

            this.onChange(value, true);
            event.preventDefault();
        }
    }

    private onKeyDown = (event) => {
        const pressedControlAndE = (_event) => (_event.ctrlKey && _event.key === "e");
        if (pressedControlAndE(event)) {
            this.props.exportSelection();
            event.preventDefault();
        }
        this.checkAutocomplete(event);
        if (!!this.props.onKeyDown) {
            this.props.onKeyDown(event);
        }
    }

    private onValueChange = () => {
        const changeFromOutsideComponent = this.props.block.pointerChanged;

        if (this.props.shouldAutosave) {
            if (changeFromOutsideComponent) {
                this.saveToDatabase();
            } else {
                this.beginAutosaveInterval();
                this.setState({ hasChangedSinceDatabaseSave: true });
            }
        }
    }

    private onChange = (value: any, pointerChanged: boolean = false) => {
        this.props.updateBlock({ id: this.props.block.id, value, pointerChanged });
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    private onAddPointerImport = (pointerId: string) => {
        const { value } = this.props.value.change()
            .insertInline(inlinePointerImportJSON(pointerId));
        this.onChange(value, true);
    }

    private considerSaveToDatabase = () => {
        if (this.state.hasChangedSinceDatabaseSave) {
            this.saveToDatabase();
        }
    }

    private saveToDatabase = () => {
        this.props.saveBlocksMutation();
        this.setState({ hasChangedSinceDatabaseSave: false });
    }

    private beginAutosaveInterval = () => {
        if (this.props.shouldAutosave && !this.autosaveInterval) {
            this.autosaveInterval = setInterval(this.considerSaveToDatabase, AUTOSAVE_EVERY_N_SECONDS * 1000);
        }
    }

    private endAutosaveInterval = () => {
        if (this.props.shouldAutosave) {
            clearInterval(this.autosaveInterval);
            delete this.autosaveInterval;
        }
    }

    private handleBlur = () => {
        if (this.props.shouldAutosave) {
            this.considerSaveToDatabase();
            this.endAutosaveInterval();
        }
    }
}

function mapStateToProps(state: any) {
    const { blockEditor } = state;
    return { blockEditor };
}

export const BlockEditorEditing: any = compose(
    connect(
        mapStateToProps, { updateBlock, exportSelection }, null, { withRef: true }
    ),
    graphql(UPDATE_BLOCKS, { name: "saveBlocksToServer", withRef: true }),
    withState("mutationStatus", "setMutationStatus", { status: MutationStatus.NotStarted }),
    withProps(({ saveBlocksToServer, block, setMutationStatus }) => {
        const saveBlocksMutation = () => {
            setMutationStatus({ status: MutationStatus.Loading });
            saveBlocksToServer({
                variables: { blocks: { id: block.id, value: valueToDatabaseJSON(block.value) } },
            }).then(() => {
                setMutationStatus({ status: MutationStatus.Complete });
            }).catch((e) => {
                setMutationStatus({ status: MutationStatus.Error, error: e });
            });
        };

        return { saveBlocksMutation, status };
    }),
)(BlockEditorEditingPresentational);