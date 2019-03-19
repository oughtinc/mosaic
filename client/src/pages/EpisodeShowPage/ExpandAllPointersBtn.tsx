import * as React from "react";
import { Button } from "react-bootstrap";
import { connect } from "react-redux";

import {
  closeAllPointerReferences,
  expandAllImports,
} from "../../modules/blockEditor/actions";

class ExpandAllPointersBtnPresentational extends React.Component<any, any> {
  public render() {
    return (
      <span style={{ marginLeft: "10px" }}>
        <Button
          bsSize="xsmall"
          onClick={() => {
            this.props.closeAllPointerReferences();
            setTimeout(() => this.props.expandAllImports(), 1);
          }}
        >
          expand imports
        </Button>
        <span style={{ display: "inline-block", width: "3px" }} />
        <Button
          bsSize="xsmall"
          onClick={this.props.closeAllPointerReferences}
        >
          collapse imports
        </Button>
      </span>
    );
  }
}

const mapStateToProps = state => ({
  willAutoExpandImports: state.blockEditor.willAutoExpandImports,
});

const mapDispatchToProps = {
  closeAllPointerReferences,
  expandAllImports,
};

const ExpandAllPointersBtn: any = connect(
  mapStateToProps,
  mapDispatchToProps
)(ExpandAllPointersBtnPresentational);

export { ExpandAllPointersBtn };
