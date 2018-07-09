import * as _ from "lodash";
import * as React from "react";
import { compose } from "recompose";
import { connect } from "react-redux";
import { ShowExpandedPointer } from "../lib/slate-pointers/ShowExpandedPointer";
import { HOVER_ITEM_TYPES, changeHoverItem } from "../modules/blockEditor/actions";

export class ShowExpandedPointerOutsideSlatePresentational extends React.Component<any, any> {

    public shouldComponentUpdate(newProps: any) {
        if (
            !_.isEqual(newProps.exportingPointer.nodes, this.props.exportingPointer.nodes)
        ) {
            return true;
        }
        return false;
    }

    public render() {
        return (
            <ShowExpandedPointer
                availablePointers={this.props.availablePointers}
                blockEditor={this.props.blockEditor}
                exportingPointer={this.props.exportingPointer}
                isHoverable={this.props.isHoverable}
                onMouseOverPointerImport={({ top, left, id }) => {
                    this.props.changeHoverItem({
                        hoverItemType: HOVER_ITEM_TYPES.POINTER_IMPORT,
                        id,
                        top,
                        left,
                        readOnly: null,
                        blockId: false,
                    });
                }}
                onMouseOverExpandedPointer={_.noop}
            />
        );
    }
}

function mapStateToProps(state: any, { exportingPointer }: any) {
    return { blockEditor: state.blockEditor, exportingPointer };
}

export const ShowExpandedPointerOutsideSlate: any = compose(
    connect(
        mapStateToProps, { changeHoverItem }
    )
)(ShowExpandedPointerOutsideSlatePresentational);
