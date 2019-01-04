import { throttle } from "lodash";
import * as React from "react";
import { Inline } from "slate";
import * as uuidv1 from "uuid/v1";
import { Editor, findDOMNode } from "slate-react";
import { compose, withProps, withState } from "recompose";
import { graphql } from "react-apollo";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { updateBlock } from "../../modules/blocks/actions";
import { MenuBar } from "./MenuBar";
import { MutationStatus } from "./types";
import { valueToDatabaseJSON } from "../../lib/slateParser";
import { exportSelection, removeExportOfSelection } from "../../modules/blockEditor/actions";
import * as _ from "lodash";
import { UPDATE_BLOCKS } from "../../graphqlQueries";
import { Change } from "./types";
import * as slateChangeMutations from "../../slate-helpers/slate-change-mutations";
import { parse as parseQueryString } from "query-string";
import { Auth } from "../../auth";

interface NextWorkspaceBtnProps {
  bsStyle: string;
  experimentId: string;
  label: string;
  navHook?: () => void;
}

const NextWorkspaceBtn = ({ bsStyle, experimentId, label, navHook }: NextWorkspaceBtnProps) => {
  return (
    <Link onClick={navHook} to={`/next?experiment=${experimentId}`} style={{ margin: "0 5px" }}>
      <Button bsSize="small" bsStyle={bsStyle}>{label} »</Button>
    </Link>
  );
};

const AUTOSAVE_EVERY_N_SECONDS = 3;
const DOLLAR_NUMBERS_NOT_NUMBER = /\$[0-9]+[^0-9]/;

function lastCharactersAfterEvent(event: any, n: any) {
  const { anchorOffset, focusNode: wholeText }: any = window.getSelection();
  if (!wholeText) {
    return "";
  }
  const text: string = wholeText.textContent.slice(
    Math.max(anchorOffset - n + 1, 0),
    anchorOffset
  );
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
      internalReferenceId: uuidv1()
    }
  });
}

// Eventually we'll type out many of these items more spefically, but that's a future refactor.
interface BlockEditorEditingPresentationalProps {
  pastedExportFormat: string;
  shouldAutoExport?: boolean;
  placeholder?: string;
  block: any;
  availablePointers: any[];
  visibleExportIds: string[];
  exportLockStatusInfo: any;
  value: any;
  mutationStatus: any;
  blockEditor: any;
  plugins: any[];
  shouldAutosave: boolean;
  cyAttributeName?: string;
  onMount(value: any): () => {};
  updateBlock(value: any): () => {};
  onChange(value: any): () => boolean;
  saveBlocksMutation(editorValue: any): any;
  exportSelection(blockId?: string): void;
  removeExportOfSelection(blockId?: string): void;
  onKeyDown(event: any): () => {};
  onPaste(event: any): () => {};
}

interface BlockEditorEditingPresentationalState {
  hasChangedSinceDatabaseSave: boolean;
  editorValue: any;
}

interface ImportPatternLocation {
  startKey: string;
  startOffset: number;
  pointerNum: number;
  length: number;
}

export class BlockEditorEditingPresentational extends React.Component<
  BlockEditorEditingPresentationalProps,
  BlockEditorEditingPresentationalState
> {
  public editor;
  private autosaveInterval: any;

  private throttledUpdate = throttle(this.props.updateBlock, 5000);

  private handleBlur = _.debounce(() => {
    this.checkGlobalImportConversion();
    if (this.props.shouldAutosave) {
      this.considerSaveToDatabase();
      this.endAutosaveInterval();
    }
  });

  public constructor(props: any) {
    super(props);
    this.state = {
      hasChangedSinceDatabaseSave: false,
      editorValue: this.props.value,
    };
  }

  public shouldComponentUpdate(newProps: any, newState: any) {
    if (
      !_.isEqual(newProps.blockEditor, this.props.blockEditor) ||
      !_.isEqual(newProps.availablePointers, this.props.availablePointers) ||
      !_.isEqual(newProps.block, this.props.block) ||
      !_.isEqual(newProps.mutationStatus, this.props.mutationStatus) ||
      !_.isEqual(
        newState.hasChangedSinceDatabaseSave,
        this.state.hasChangedSinceDatabaseSave
      ) ||
      !_.isEqual(newProps.exportLockStatusInfo, this.props.exportLockStatusInfo) ||
      !_.isEqual(newProps.visibleExportIds, this.props.visibleExportIds) ||
      !_.isEqual(newProps.shouldAutoExport, this.props.shouldAutoExport) ||
      !_.isEqual(newProps.pastedExportFormat, this.props.pastedExportFormat) ||
      !_.isEqual(newState.editorValue, this.state.editorValue)
    ) {
      return true;
    }
    return false;
  }

  public componentWillMount() {
    this.props.onMount(this);
  }

  public componentWillUnmount() {
    this.props.updateBlock({
      id: this.props.block.id,
      value: this.state.editorValue,
      pointerChanged: true
    });

    if (this.props.shouldAutosave) {
      const isUserAdmin = Auth.isAdmin();
      const isUserInExperiment = parseQueryString(window.location.search).experiment;
      if (isUserAdmin || isUserInExperiment) {
        this.saveToDatabase();
        this.endAutosaveInterval();
      }
    }
  }

  public componentDidUpdate(prevProps: any, prevState: any) {
    const oldEditorValue = prevState.editorValue;
    const newEditorValue = this.state.editorValue;

    if (JSON.stringify(oldEditorValue) !== JSON.stringify(newEditorValue)) {
      this.onValueChange();
    }

    const underlyingDOMNode = this.editor && findDOMNode(this.editor.value.document);
    if (underlyingDOMNode && this.props.cyAttributeName) {
      underlyingDOMNode.setAttribute("data-cy", this.props.cyAttributeName);
    }

    if (!prevProps.shouldAutoExport && this.props.shouldAutoExport) {
      this.handleSquareBracketExport();
    }

    if (prevProps.value !== this.props.value) {
      this.setState({ editorValue: this.props.value });
    }
  }

  public componentDidMount() {
    const change = slateChangeMutations.normalizeExportSpacing(
      this.props.block.value.change()
    );
    this.props.updateBlock({
      id: this.props.block.id,
      value: change.value,
      pointerChanged: false
    });
  }

  public render() {
    return (
      <div>
        <MenuBar
          blockEditor={this.props.blockEditor}
          mutationStatus={this.props.mutationStatus}
          hasChangedSinceDatabaseSave={this.state.hasChangedSinceDatabaseSave}
        />
        <div
          style={{
            paddingRight: "8px",
            position: "relative",
          }}
        >
          <div
            style={{
              alignItems: "center",
              backgroundColor: "#eaa",
              border: "1px solid #aaa",
              borderRadius: "4px",
              boxShadow: "1px 1px 6px #bbb",
              display: this.props.mutationStatus.status === MutationStatus.Error ? "flex" : "none",
              justifyContent: "space-around",
              left: "50%",
              marginLeft: "-300px",
              padding: "10px",
              position: "fixed",
              top: "150px",
              width: "600px",
              zIndex: 1000,
            }}
          >
            {
              this.props.mutationStatus
              &&
              this.props.mutationStatus.error
              &&
              this.props.mutationStatus.error.message.slice(15)
            }
            {
              parseQueryString(window.location.search).experiment
              &&
              <NextWorkspaceBtn
                bsStyle="default"
                experimentId={parseQueryString(window.location.search).experiment}
                label={"Find assigned workspace"}
              />
            }
          </div>
          <Editor
            placeholder={this.props.placeholder}
            value={this.state.editorValue}
            onChange={this.onChangeCallback}
            plugins={this.props.plugins}
            spellCheck={false}
            onBlur={this.handleBlur}
            onKeyDown={this.onKeyDown}
            onKeyUp={this.onKeyUp}
            onPaste={this.onPaste}
            ref={this.updateEditor}
          />
        </div>
      </div>
    );
  }

  private getImportPatternLocationsInTextNode(node: any): ImportPatternLocation[] {
    const locations: ImportPatternLocation[] = [];
    let inMatch = false;
    let matchStart = -1;
    let matchChars = "";
    const text = node.text;
    for (let ii = 0; ii < text.length; ii++) {
      if (inMatch) {
        const charIsNumber = !!text[ii].match(DOLLAR_NUMBERS_NOT_NUMBER);

        if (charIsNumber) {
          matchChars = matchChars.concat(text[ii]);
        }
        if ((!charIsNumber || ii === text.length - 1) && (matchChars.length > 0))  {
          locations.push({
            startKey: node.key,
            startOffset: matchStart,
            pointerNum: Number(matchChars),
            length: matchChars.length + 1
          });
          inMatch = false;
        }
      }
      if (text[ii] === "$") {
        inMatch = true;
        matchStart = ii;
        matchChars = "";
      }
    }

    return locations;
  }

  private getImportPatternLocationsInArrayOfTextNodes(textNodes: any[]): ImportPatternLocation[] {
    // We only find import patterns contained within a single text node.
    const locationsPerNode = _.map(textNodes, node => this.getImportPatternLocationsInTextNode(node));
    return _.flatten(locationsPerNode);
  }

  // Checks whether current input focus is at the very end of the import pattern location.
  private isActiveImportPatternLocation(location: ImportPatternLocation) {
    return (
      this.props.value.focusKey === location.startKey &&
      this.props.value.focusOffset === (location.startOffset + location.length)
    );
  }

  // Attempts to convert text at the given location (e.g. "$3") to a corresponding inline import node.
  private convertImportPatternLocation(location: ImportPatternLocation) {
    const pointer = this.props.availablePointers[location.pointerNum - 1];

    if (!!pointer) {
      const { value } = this.state.editorValue
        .change()
        .select({
          anchorKey: location.startKey,
          anchorOffset: location.startOffset,
          focusKey: location.startKey,
          focusOffset: location.startOffset,
        })
        .deleteForward(location.length)
        .insertInline(inlinePointerImportJSON(pointer.data.pointerId))
        .collapseToStartOfNextText()
        .focus();

      this.onChange(value, true);
      return true;
    }

    return false;
  }

  // Returns true if we should prevent current character from being inserted, false otherwise.
  private checkKeydownImportConversion(event: any) {
      // Attempts import conversions in the focused node only.
    let locations: ImportPatternLocation[] = this.getImportPatternLocationsInArrayOfTextNodes([this.props.value.focusText]);
    const isNumberKey = !!event.key.match(NUMBER_REGEX);

    if (isNumberKey) {
      // Do not attempt to complete the focused location (if any), since we could still be adding to it.
      locations = _.filter(locations, loc => !this.isActiveImportPatternLocation(loc));
    }

    let anyConverted = false;
    locations.forEach(location => {
      if (this.convertImportPatternLocation(location)) {
        anyConverted = true;
      }
    });

    // Both Enter and Left Arrow appear to have default behavior inside Slate interfering with the conversion.
    if ((event.key === "Enter" || event.key === "ArrowLeft") && anyConverted) {
      return true;
    }

    return false;
  };

  // Attempts import conversions on the whole block.
  private checkGlobalImportConversion() {
    const textNodesArray = this.props.value.document.getTexts().toArray();
    const locations: ImportPatternLocation[] = this.getImportPatternLocationsInArrayOfTextNodes(textNodesArray);
    locations.forEach(location => this.convertImportPatternLocation(location));
  }

  private onKeyDown = (event: any, change: Change) => {
    const pressedMetaAndE = _event => _event.metaKey && _event.key === "e";
    if (pressedMetaAndE(event)) {
      this.props.exportSelection(this.props.block.id);
      event.preventDefault();
    }

    const pressedMetaAndK = _event => _event.metaKey && _event.key === "k";
    if (pressedMetaAndK(event)) {
      this.props.removeExportOfSelection(this.props.block.id);
      event.preventDefault();
    }

    if (!!this.props.onKeyDown) {
      this.props.onKeyDown(event);
    }

    const shouldPreventDefault = this.checkKeydownImportConversion(event);
    if (shouldPreventDefault) {
      return false;
    }

    return undefined;
  };

  private handleSquareBracketExport = () => {
    // check to see whether there are a balanced number of square brackets
    // if there are, everything within the outermost brackets gets exported
    const {
      wasMutationPerformed
    } = slateChangeMutations.scanBlockAndConvertOuterSquareBrackets({
      change: this.state.editorValue.change(),
      updateBlock: this.props.updateBlock,
      exportSelection: this.props.exportSelection,
      blockId: this.props.block.id
    });

    // if something was exported, redo this process
    if (wasMutationPerformed) {
      setTimeout(this.handleSquareBracketExport, 10);
    }
  };

  private onKeyUp = (event: any, change: any) => {
    if (this.props.shouldAutoExport) {
      this.handleSquareBracketExport();
    }
  };

  private onPaste = (event: any) => {
    // We do this in a timeout to avoid interactions with the linkify plugin.
    // Ideally we could just put this at the appropriate point in the plugin stack and pass the change value through.
    setTimeout(() => this.checkGlobalImportConversion(), 0);
    return undefined;
  }

  private onValueChange = () => {
    if (this.props.shouldAutosave) {
      this.beginAutosaveInterval();
      this.setState({ hasChangedSinceDatabaseSave: true });
    }
  };

  private onChangeCallback = (c: Change) => {
    // first check to see if document changed, which we can do with !== b/c
    // Slate uses immutable objects, if it has changed then normalize wrt
    // pointer spacing
    const documentHasChanged =
      c.value.document !== this.props.block.value.document;
    if (documentHasChanged) {
      slateChangeMutations.normalizeExportSpacing(c);
    }

    // the following function is trying to prevent
    // the user from using a click to get the text cursor in an off-limit spot,
    // the onClick handler didn't seem to have access to the new cursor position
    // so this lives here instead
    slateChangeMutations.adjustCursorIfAtEdge(c);

    // make sure no two blocks are side by side
    // assumes blocks are on same level
    // after we update Slate, can redo this very elegantly as a schema
    let blocks = c.value.document.getBlocks();
    while (blocks.size > 2) {
      const secondBlock = blocks.get(1);
      const firstTextOfsecondBlock = secondBlock.getFirstText();
      c.insertTextByKey(firstTextOfsecondBlock.key, 0, "\n");
      c.mergeNodeByKey(secondBlock.key);
      blocks = c.value.document.getBlocks();
    }

    this.onChange(c.value);
  };

  private onChange = (value: any, pointerChanged: boolean = false) => {
    this.throttledUpdate({ id: this.props.block.id, value, pointerChanged });

    this.setState({ editorValue: value });

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  private updateEditor = (input: any) => {
    this.editor = input;
  };

  private considerSaveToDatabase = () => {
    if (this.state.hasChangedSinceDatabaseSave) {
      this.saveToDatabase();
    }
  };

  private saveToDatabase = () => {
    this.props.saveBlocksMutation(this.state.editorValue);
    this.setState({ hasChangedSinceDatabaseSave: false });
  };

  private beginAutosaveInterval = () => {
    if (this.props.shouldAutosave && !this.autosaveInterval) {
      this.autosaveInterval = setInterval(
        this.considerSaveToDatabase,
        AUTOSAVE_EVERY_N_SECONDS * 1000
      );
    }
  };

  private endAutosaveInterval = () => {
    if (this.props.shouldAutosave) {
      clearInterval(this.autosaveInterval);
      delete this.autosaveInterval;
    }
  };
}

function mapStateToProps(state: any) {
  const { blockEditor } = state;
  return { blockEditor };
}

export const BlockEditorEditing: any = compose(
  connect(
    mapStateToProps,
    { updateBlock, exportSelection, removeExportOfSelection },
    null,
    { withRef: true }
  ),
  graphql(UPDATE_BLOCKS, {
    name: "saveBlocksToServer",
    withRef: true,
    options: {
      variables: {
        experimentId: parseQueryString(window.location.search).experiment,
      },
    }
  }),
  withState("mutationStatus", "setMutationStatus", {
    status: MutationStatus.NotStarted
  }),
  withProps(({ saveBlocksToServer, block, setMutationStatus }) => {
    const saveBlocksMutation = editorValue => {
      setMutationStatus({ status: MutationStatus.Loading });

      saveBlocksToServer({
        variables: {
          blocks: { id: block.id, value: valueToDatabaseJSON(editorValue) }
        }
      }).then(() => {
          setMutationStatus({ status: MutationStatus.Complete });
        })
        .catch(e => {
          setMutationStatus({ status: MutationStatus.Error, error: e });
        });
    };

    return { saveBlocksMutation, status };
  })
)(BlockEditorEditingPresentational);
