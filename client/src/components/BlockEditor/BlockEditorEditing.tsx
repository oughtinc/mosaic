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

export class BlockEditorEditingPresentational extends React.Component<any, any> {

    public constructor(props: any) {
        super(props);
        this.onChange = this.onChange.bind(this);
        setInterval(() => this.props.mutation(), 1000);
    }

    public onChange(value: any) {
        this.props.updateBlock({ id: this.props.block.id, value });
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    public render() {
        console.log();
        return (
            <div onBlur={this.props.mutation}>
                {this.renderSaveIcon(this.props.mutationStatus.status)}
                <BlockEditorStyle>
                    <DropdownButton title="Import" id="bg-nested-dropdown" bsSize={"xsmall"} style={{ marginBottom: "5px" }}>
                        {this.props.availablePointers.map((e: any, index: number) => (
                            <MenuItem
                                eventKey="1"
                                key={index}
                                onClick={(event) => {
                                    const ch = this.props.value.change()
                                        .insertInline(Inline.fromJSON({
                                            object: "inline",
                                            type: "pointerImport",
                                            isVoid: true,
                                            data: {
                                                pointerId: e.data.pointerId,
                                                internalReferenceId: uuidv1(),
                                            },
                                        }));
                                    this.props.onChange(ch.value);
                                }}
                            >
                                <span>
                                    {`$${index + 1} - ${e.data.pointerId.slice(0, 5)}`}
                                    <ShowExpandedPointer
                                        exportingPointer={e}
                                        exportingPointers={this.props.availablePointers}
                                        blockEditor={this.props.blockEditor}
                                        isHoverable={false}
                                    />
                                </span>
                            </MenuItem>
                        ))}
                    </DropdownButton>
                    <Editor
                        value={this.props.value}
                        onChange={(c) => this.onChange(c.value)}
                        plugins={this.props.plugins}
                    />
                    {this.props.autoSave && <div onClick={this.props.mutation}>
                        save me
                    </div>}
                </BlockEditorStyle>
            </div>
        );
    }

    private renderSaveIcon(mutationStatus: MutationStatus) {
      switch (mutationStatus) {
        case MutationStatus.NOT_STARTED: {
          return null;
        }
        case MutationStatus.LOADING: {
          return <i className="fa fa-spinner" />;
        }
        case MutationStatus.COMPLETE: {
          return <i className="fa fa-check" />;
        }
        case MutationStatus.ERROR: {
          return <i className="fa fa-exclamation-triangle" />;
        }
        default: {
          return null;
        }
      }
    }
}

enum MutationStatus {
    NOT_STARTED = 0,
    LOADING,
    COMPLETE,
    ERROR,
}

export const BlockEditorEditing: any = compose(
    connect(
        () => ({}), { updateBlock }
    ),
    graphql(UPDATE_BLOCKS, { name: "saveBlocksToServer" }),
    withState("mutationStatus", "setMutationStatus", { status: MutationStatus.NOT_STARTED }),
    withProps(({ saveBlocksToServer, block, setMutationStatus }) => {
        const mutation = (value) => {
            setMutationStatus({ status: MutationStatus.LOADING });
            saveBlocksToServer({
                variables: { blocks: { id: block.id, value: block.value.toJSON() } },
            }).then(() => {
                setMutationStatus({ status: MutationStatus.COMPLETE });
            }).catch((e) => {
                setMutationStatus({ status: MutationStatus.ERROR, error: e });
            });
        };

        return { mutation, status };
    })
)(BlockEditorEditingPresentational);