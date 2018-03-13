import React = require("react");
import { exportingPointersSelector } from "../modules/blocks/exportingPointers";
import { compose } from "recompose";
import { connect } from "react-redux";
import { ShowExpandedPointer } from "../lib/slate-pointers/ShowExpandedPointer";
import { HOVER_ITEM_TYPES, changeHoverItem } from "../modules/blockEditor/actions";

export class ShowExpandedPointerOutsideSlatePresentational extends React.Component<any, any> {
    public render() {
        return (
            <ShowExpandedPointer
                exportingPointers={this.props.exportingPointers}
                blockEditor={this.props.blockEditor}
                exportingPointer={this.props.exportingPointer}
                onMouseOverPointerImport={({ top, left, id }) => {
                    this.props.changeHoverItem({
                        hoverItemType: HOVER_ITEM_TYPES.POINTER_IMPORT,
                        id,
                        top,
                        left,
                        blockId: false,
                    });
                }}
                onMouseOverExpandedPointer={() => {}} 
            />
        );
    }
}

function mapStateToProps(state: any, { exportingPointer }: any) {
    const exportingPointers = exportingPointersSelector(state);
    return { exportingPointers, blockEditor: state.blockEditor, exportingPointer };
}

export const ShowExpandedPointerOutsideSlate: any = compose(
    connect(
        mapStateToProps, {changeHoverItem}
    )
)(ShowExpandedPointerOutsideSlatePresentational);