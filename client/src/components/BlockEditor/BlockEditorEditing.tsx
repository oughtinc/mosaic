import * as React from "react";
import styled from "styled-components";
import { DropdownButton, MenuItem } from "react-bootstrap";
import { Inline } from "slate";
import * as uuidv1 from "uuid/v1";
import { ShowExpandedPointer } from "../../lib/slate-pointers/ShowExpandedPointer";
import { Editor } from "slate-react";
import { compose, withProps, withState } from "recompose";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import { updateBlock } from "../../modules/blocks/actions";
import { MenuBar } from "./MenuBar";
import { MutationStatus } from "./types";
import _ = require("lodash");

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

export class BlockEditorEditingPresentational extends React.Component<any, any> {

    private autoSaveInterval: any;

    public constructor(props: any) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.startAutosave = this.startAutosave.bind(this);
        this.endAutosave = this.endAutosave.bind(this);
        this.saveToDatabase = this.saveToDatabase.bind(this);
        this.onAddPointerImport = this.onAddPointerImport.bind(this);
        this.state = {hasChangedSinceDatabaseSave: false};
    }

    public componentWillUnmount() {
        this.endAutosave();
    }

    public componentWillReceiveProps(nextProps) {
        const blockChanged = this.props.block.value
            && ! _.isEqual(this.props.block.value, nextProps.block.value);
        if (blockChanged && this.props.autoSave) {
            this.onChange(nextProps.block.value);
            this.saveToDatabase();
        }
    }

    public render() {
        return (
            <div>
                <BlockEditorStyle>
                    <MenuBar
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
                        onFocus={this.startAutosave}
                    />
                </BlockEditorStyle>
            </div>
        );
    }

    private onChange(value: any) {
        this.props.updateBlock({ id: this.props.block.id, value });
        if (this.props.onChange) {
            this.props.onChange(value);
        }

        const oldDocument = this.props.block.value.document;
        const newDocument = value.document;
        if (!oldDocument.equals(newDocument)) {
            this.setState({hasChangedSinceDatabaseSave: true});
        }
    }

    private onAddPointerImport(pointerId: string) {
        const ch = this.props.value.change()
            .insertInline(Inline.fromJSON({
                object: "inline",
                type: "pointerImport",
                isVoid: true,
                data: {
                    pointerId: pointerId,
                    internalReferenceId: uuidv1(),
                },
            }));
        this.onChange(ch.value);
    }

    private saveToDatabase() {
        if (this.state.hasChangedSinceDatabaseSave) {
            this.props.mutation();
            this.setState({hasChangedSinceDatabaseSave: false});
        }
    }

    private startAutosave() {
        if (this.props.autoSave) {
            this.autoSaveInterval = setInterval(this.saveToDatabase, AUTOSAVE_EVERY_N_SECONDS * 1000);
        }
    }

    private endAutosave() {
        if (this.props.autoSave) {
            clearInterval(this.autoSaveInterval);
        }
    }

    private handleBlur() {
        if (this.props.autoSave) {
            this.saveToDatabase();
            this.endAutosave();
        }
    }
}

export const BlockEditorEditing: any = compose(
    connect(
        () => ({}), { updateBlock }
    ),
    graphql(UPDATE_BLOCKS, { name: "saveBlocksToServer" }),
    withState("mutationStatus", "setMutationStatus", { status: MutationStatus.NotStarted }),
    withProps(({ saveBlocksToServer, block, setMutationStatus }) => {
        const mutation = () => {
            setMutationStatus({ status: MutationStatus.Loading });
            saveBlocksToServer({
                variables: { blocks: { id: block.id, value: block.value.toJSON() } },
            }).then(() => {
                setMutationStatus({ status: MutationStatus.Complete });
            }).catch((e) => {
                setMutationStatus({ status: MutationStatus.Error, error: e });
            });
        };

        return { mutation, status };
    })
)(BlockEditorEditingPresentational);