import * as React from "react";
import { Button } from "react-bootstrap";
import { connect } from "react-redux";

import {
  CLOSE_ALL_POINTER_REFERENCES,
  EXPAND_ALL_IMPORTS,
} from "../../modules/blockEditor/actions";

class ExpandAllPointersBtnPresentational extends React.Component<any, any> {
  public render() {
    return (
      <span style={{ marginLeft: "10px" }}>
        <Button
          bsSize="xsmall"
          onClick={() => {
            this.props.collapseAllImports();
            setTimeout(() => this.props.expandAllImports(), 1);
          }}
        >
          expand imports
        </Button>
        <span style={{ display: "inline-block", width: "3px" }} />
        <Button
          bsSize="xsmall"
          onClick={this.props.collapseAllImports}
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

const mapDispatchToProps = dispatch => ({
  collapseAllImports: () => dispatch({ type: CLOSE_ALL_POINTER_REFERENCES }),
  expandAllImports: () => dispatch({ type: EXPAND_ALL_IMPORTS }),
});

const ExpandAllPointersBtn: any = connect(
  mapStateToProps,
  mapDispatchToProps
)(ExpandAllPointersBtnPresentational);

export { ExpandAllPointersBtn };
