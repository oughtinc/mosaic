import * as React from "react";
import { connect } from "react-redux";
import { HistoryListener } from "./HistoryListener";
import { closeAllPointerReferences } from "../modules/blockEditor/actions";

class ListenerThatClosesPointersOnPathnameChangeBase extends React.Component<any, any> {
  public render() {
    return (
      <HistoryListener
        onPathnameChange={this.props.closeAllPointerReferences}
      />
    );
  }
}

export const ListenerThatClosesPointersOnPathnameChange: any = connect(
  null,
  { closeAllPointerReferences }
)(ListenerThatClosesPointersOnPathnameChangeBase);
