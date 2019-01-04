import * as React from "react";
import { Inline } from "slate";
import * as uuidv1 from "uuid/v1";
import { Editor } from "slate-react";
import { compose, withProps, withState } from "recompose";
import { graphql } from "react-apollo";
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

const AUTOSAVE_EVERY_N_SECONDS = 3;
const NUMBER_REGEX = /[0-9]/;

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
  onMount(value: any): () => {};
  updateBlock(value: any): () => {};
  onChange(value: any): () => boolean;
  saveBlocksMutation(): () => {};
  exportSelection(blockId?: string): void;
  removeExportOfSelection(blockId?: string): void;
  onKeyDown(event: any): () => {};
  onPaste(event: any): () => {};
}

interface BlockEditorEditingPresentationalState {
  hasChangedSinceDatabaseSave: boolean;
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

  private handleBlur = _.debounce(() => {
    this.checkGlobalImportConversion();
    if (this.props.shouldAutosave) {
      this.considerSaveToDatabase();
      this.endAutosaveInterval();
    }
  });

  public constructor(props: any) {
    super(props);
    this.state = { hasChangedSinceDatabaseSave: false };
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
      !_.isEqual(newProps.visibleExportIds, this.props.visibleExportIds)
    ) {
      return true;
    }
    return false;
  }

  public componentWillMount() {
    this.props.onMount(this);
  }

  public componentWillUnmount() {
    if (this.props.shouldAutosave) {
      this.saveToDatabase();
      this.endAutosaveInterval();
    }
  }

  public componentDidUpdate(prevProps: any) {
    const oldDocument = prevProps.block.value.document;
    const newDocument = this.props.block.value.document;

    if (!oldDocument.equals(newDocument)) {
      this.onValueChange();
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
        <Editor
          placeholder={this.props.placeholder}
          value={this.props.value}
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
        const charIsNumber = !!text[ii].match(NUMBER_REGEX);

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
      const { value } = this.props.value
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

    const converted = (locations.length !== 0) && this.convertImportPatternLocation(locations[0]);

    // Both Enter and arrows appear to have default behavior inside Slate interfering with the conversion.
    if (converted && (event.key === "Enter" || event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      return true;
    }

    return false;
  }

  // Attempts import conversions on the whole block.
  private checkGlobalImportConversion() {
    const textNodesArray = this.props.value.document.getTexts().toArray();
    const locations: ImportPatternLocation[] = this.getImportPatternLocationsInArrayOfTextNodes(textNodesArray);
    if ((locations.length !== 0) && this.convertImportPatternLocation(locations[0])) {
      this.checkGlobalImportConversion();
    }
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
      change: this.props.value.change(),
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
    this.handleSquareBracketExport();
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
    this.props.updateBlock({ id: this.props.block.id, value, pointerChanged });
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
    this.props.saveBlocksMutation();
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
  graphql(UPDATE_BLOCKS, { name: "saveBlocksToServer", withRef: true }),
  withState("mutationStatus", "setMutationStatus", {
    status: MutationStatus.NotStarted
  }),
  withProps(({ saveBlocksToServer, block, setMutationStatus }) => {
    const saveBlocksMutation = () => {
      setMutationStatus({ status: MutationStatus.Loading });
      saveBlocksToServer({
        variables: {
          blocks: { id: block.id, value: valueToDatabaseJSON(block.value) }
        }
      })
        .then(() => {
          setMutationStatus({ status: MutationStatus.Complete });
        })
        .catch(e => {
          setMutationStatus({ status: MutationStatus.Error, error: e });
        });
    };

    return { saveBlocksMutation, status };
  })
)(BlockEditorEditingPresentational);
