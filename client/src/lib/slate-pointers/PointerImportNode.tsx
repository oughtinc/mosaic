import { css, StyleSheet } from "aphrodite";
import * as React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import styled from "styled-components";
import { ShowExpandedPointer } from "./ShowExpandedPointer";
import { propsToPointerDetails } from "./helpers";
import { changePointerReference, removeImportFromStore } from "../../modules/blockEditor/actions";
import { getInputCharCount } from "../../modules/blocks/charCounts";
import { Auth } from "../../auth";

import {
  lockedPointerImportBgColor,
  lockedPointerImportBgColorOnHover,
  unlockedImportBgColor,
  unlockedImportBgColorOnHover,
} from "../../styles";

const RemovedPointer = styled.span`
  background-color: rgba(252, 86, 86, 0.66);
  padding: 0 3px;
  border-radius: 2px;
  font-weight: 800;
  color: #7f0a0a;
`;

const bracketFont = "800 1.2em sans-serif";

// getting rid fo this and putting ClosedPointerImport's props onto the nested
// span leads to a Typescript error, seems to be a known TS bug, maybe
// upgrading TS will fix it, looking into it wasn't a priority, so just keeping
// this for now
const ClosedPointerImport: any = styled.span``;

const OpenPointerImport: any = styled.span`
  background: ${(props: any) =>
    props.isLazy
    ?
      "rgba(244, 158, 158)"
      :
    (
      props.isSelected
      ? "rgba(111, 186, 209, 0.66)"
      : "rgba(158, 224, 244, 0.66)"
    )};
  border-radius: 2px;
  color: #000;
  cursor: pointer;
  font-weight: 500;
  transition: background-color color 0.8s;
`;

const Brackets: any = styled.span`
  &:before {
    color: ${(props: any) => props.isLazy ? "red" : unlockedImportBgColor};
    content: "[";
    font: ${bracketFont};
  }

  &:after {
    color: ${(props: any) => props.isLazy ? "red" : unlockedImportBgColor};
    content: "]";
    font: ${bracketFont};
  }
`;

class PointerImportNodePresentational extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);

    const onHomepageOrTreeView = !props.exportLockStatusInfo;
    if (onHomepageOrTreeView) {
      this.state = {
        isLocked: false,
      };
    } else {
      const exportPointerId = props.nodeAsJson.data.pointerId;
      const isLockedRelation = props.exportLockStatusInfo && props.exportLockStatusInfo.find(obj => obj.pointerId === exportPointerId);
      const exportIsVisible = this.props.visibleExportIds.find(id => id === exportPointerId);
      const isLocked =
        Auth.isAuthenticated()
        &&
        !exportIsVisible && (!isLockedRelation || isLockedRelation.isLocked);

      this.state = {
        isLocked,
      };
    }
  }

  public componentDidMount() {
    const isOnTreePage = window.location.pathname.endsWith("subtree");

    if (isOnTreePage) {
      return;
    }

    const isAdminNotInFlow = Auth.isAdmin() && !this.props.isActive;
    const isOracleInOracleMode = this.props.isInOracleMode && this.props.isUserOracle;

    if (!this.props.hasExportBeenOpened && (isAdminNotInFlow || isOracleInOracleMode)) {
      const pointerId: string = this.props.nodeAsJson.data.internalReferenceId;
      const exportPointerId: string = this.props.nodeAsJson.data.pointerId;
      if (!this.props.ancestorPointerIds || this.props.ancestorPointerIds.indexOf(exportPointerId) === -1) {
        this.props.openClosedPointer(pointerId, exportPointerId);
      }
    }
  }

  public componentWillUnmount() {
    const importId = this.props.nodeAsJson.data.internalReferenceId;
    this.props.removeImportFromStore(importId);
  }

  public getLocation = () => {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    const { left, right, top, bottom } = rect;
    return { left, right, top, bottom };
  };

  public onMouseOver = () => {
    if (this.props.isHoverable) {
      const { left, right, top, bottom } = this.getLocation();
      this.props.onMouseOver({
        left,
        right,
        top,
        bottom,
        id: this.props.nodeAsJson.data.internalReferenceId
      });
    }
  };

  public handleClosedPointerClick = (e: Event, pointerId: string, exportPointerId: string) => {
    const isActive = this.props.isActive;

    if (this.isLocked() && this.state.isLocked) {
      this.setState({ isLocked: false });
      if (isActive) {
        this.props.unlockPointer(exportPointerId);
      }
      setTimeout(() => { this.props.openClosedPointer(pointerId, exportPointerId); }, 400);
    } else {
      this.props.openClosedPointer(pointerId, exportPointerId);
    }
    e.stopPropagation( );
  }

  public handleOpenPointerClick = (e: Event, pointerId: string, exportId: string) => {
    this.props.closeOpenPointer(pointerId, exportId);
    e.stopPropagation();
  }

  public isLocked() {
    const onHomepageOrTreeView = !this.props.exportLockStatusInfo;
    if (onHomepageOrTreeView || this.props.isInOracleModeAndIsUserOracle) {
      return false;
    }

    const exportPointerId = this.props.nodeAsJson.data.pointerId;
    const isLockedRelation = this.props.exportLockStatusInfo.find(obj => obj.pointerId === exportPointerId);
    const exportIsVisible = this.props.visibleExportIds.find(id => id === exportPointerId);
    const isLocked =
      Auth.isAuthenticated()
      &&
      !exportIsVisible && (!isLockedRelation || isLockedRelation.isLocked);

    return isLocked;
  }

  public render() {
    const {
      availablePointers,
      blockEditor,
      visibleExportIds,
      nodeAsJson,
    } = this.props;

    const {
      importingPointer,
      isSelected,
      pointerIndex,
      isOpen
    } = propsToPointerDetails({
      blockEditor,
      availablePointers,
      nodeAsJson
    });

    if (!importingPointer) {
      return (
        <RemovedPointer
          onMouseOver={this.onMouseOver}
          onMouseOut={this.props.onMouseOut}
        >
          N/A
        </RemovedPointer>
      );
    }

    const isLocked = this.state.isLocked && this.isLocked();

    const pointerId: string = this.props.nodeAsJson.data.internalReferenceId;
    const exportPointerId: string = this.props.nodeAsJson.data.pointerId;

    const exportPointer = availablePointers.find(p => p.data.pointerId === exportPointerId);
    const exportPointerInputCharCount = exportPointer && getInputCharCount(exportPointer);

    const isExportPointerFirstNodeTextNode = exportPointer.nodes[0].object === "text";
    const exportPointerText = exportPointer.nodes[0].leaves[0].text.trim();
    const isLazyPointer = isExportPointerFirstNodeTextNode && exportPointerText.slice(0, 2) === "@L";

    const styles = StyleSheet.create({
      OuterPointerImportStyle: {
        ":before": {
          backgroundColor: isLazyPointer ? "red" : (isLocked ? lockedPointerImportBgColor : unlockedImportBgColor),
          color: "rgb(233, 239, 233)",
          content: `"$${pointerIndex + 1}"`,
          borderRadius: "4px 0px 0px 4px",
          padding: "0px 3px",
        },
      },
      ClosedPointerImportStyle: {
        backgroundColor: isLazyPointer ? "red" : (isLocked ? lockedPointerImportBgColor : unlockedImportBgColor),
        color: "rgb(233, 239, 233)",
        cursor: isLazyPointer ? "auto" : "pointer",
        padding: "0 4px",
        borderRadius: "4px",
        transition: "background-color color 0.8s",
        whiteSpace: "nowrap",
        ":hover": {
          backgroundColor: isLazyPointer ? "red" : (isLocked ? lockedPointerImportBgColorOnHover : unlockedImportBgColorOnHover),
        }
      },
    });

    const tooltip = (
      <Tooltip id="tooltip" style={{ display: !isLocked && "none" }}>
        <strong>{exportPointerInputCharCount}</strong> char{exportPointerInputCharCount === 1 ? "" : "s"}
      </Tooltip>
    );

    if (isLazyPointer) {
      const isOracleInOracleMode = this.props.isInOracleMode && this.props.isUserOracle;
      if (!isOracleInOracleMode) {
        return (
          <ClosedPointerImport
            className={css(styles.ClosedPointerImportStyle)}
          >
            <span
              key={exportPointerId}
              style={{
                display: "inline-block",
                filter: "brightness(110%) saturate(400%)",
                fontSize: "smaller",
                transform: !isLocked && "scale(0, 0)",
                transition: "all 0.5s",
                maxWidth: isLocked ? "90px" : 0,
                verticalAlign: "middle",
              }}
              data-cy="closed-import"
            >
              🔒
            </span>
            {`$${pointerIndex + 1}`}
          </ClosedPointerImport>
        );
      }
    }

    if (!isOpen) {
      return (
        <OverlayTrigger placement="top" overlay={tooltip}>
          <ClosedPointerImport
            className={css(styles.ClosedPointerImportStyle)}
            onClick={e => this.handleClosedPointerClick(e, pointerId, exportPointerId)}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.props.onMouseOut}
          >
            <span
              key={exportPointerId}
              style={{
                display: "inline-block",
                filter: "brightness(110%) saturate(400%)",
                fontSize: "smaller",
                transform: !isLocked && "scale(0, 0)",
                transition: "all 0.5s",
                maxWidth: isLocked ? "90px" : 0,
                verticalAlign: "middle",
              }}
              data-cy="closed-import"
            >
              🔒
            </span>
            {`$${pointerIndex + 1}`}
          </ClosedPointerImport>
        </OverlayTrigger>
      );
    } else {
      return (
        <OpenPointerImport
          isLazy={isLazyPointer}
          isSelected={isSelected}
          onClick={e => this.handleOpenPointerClick(e, pointerId, exportPointerId)}
        >
          <span className={css(styles.OuterPointerImportStyle)}>
            <span onClick={e => e.stopPropagation()}>
              <Brackets isLazy={isLazyPointer}>
                <ShowExpandedPointer
                  isActive={this.props.isActive}
                  ancestorPointerIds={!this.props.ancestorPointerIds ? [exportPointerId] : [...this.props.ancestorPointerIds, exportPointerId]}
                  isInOracleMode={this.props.isInOracleMode}
                  isUserOracle={this.props.isUserOracle}
                  blockEditor={blockEditor}
                  exportingPointer={importingPointer}
                  availablePointers={availablePointers}
                  onMouseOverExpandedPointer={this.onMouseOver}
                  onMouseOverPointerImport={this.props.onMouseOver}
                  onMouseOut={this.props.onMouseOut}
                  isHoverable={this.props.isHoverable}
                  visibleExportIds={visibleExportIds}
                  exportLockStatusInfo={this.props.exportLockStatusInfo}
                  isInOracleModeAndIsUserOracle={this.props.isInOracleModeAndIsUserOracle}
                  unlockPointer={this.props.unlockPointer}
                />
              </Brackets>
            </span>
          </span>
        </OpenPointerImport>
      );
    }
  }
}

const mapStateToProps = (state, props) => ({
  hasExportBeenOpened: state.blockEditor.exportsOpened.indexOf(props.nodeAsJson.data.pointerId) > -1,
});

const mapDispatchToProps = (dispatch: (actionObjectOrThunkFn: any) => any) => ({
  openClosedPointer: (pointerId: string, exportId: string) => dispatch(changePointerReference({
    id: pointerId,
    reference: { isOpen: true },
    exportId,
  })),

  closeOpenPointer: (pointerId: string, exportId: string) => dispatch(changePointerReference({
    id: pointerId,
    reference: { isOpen: false },
    exportId,
  })),

  removeImportFromStore: importId => dispatch(removeImportFromStore(importId))
});

export const PointerImportNode = connect(mapStateToProps, mapDispatchToProps)(PointerImportNodePresentational);
