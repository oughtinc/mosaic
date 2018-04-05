import * as React from "react";
import { compose } from "recompose";
import { connect } from "react-redux";
import { removeHoverItem } from "../../modules/blockEditor/actions";

class BlockHoverMenuPresentational extends React.Component<any, any> {
    public menu;

    public constructor(props: any) {
        super(props);
    }

    public render() {
            return (
                <div>
                    {this.props.children}
                </div>
            );
        }
}

export const BlockHoverMenu: any = compose(
    connect(
        ({ blockEditor }) => ({ blockEditor }),
        {removeHoverItem}
    )
)(BlockHoverMenuPresentational);
