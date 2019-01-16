import * as React from "react";
import { Inline } from "slate";
import * as uuidv1 from "uuid/v1";
import { Editor, findDOMNode } from "slate-react";
import { compose, withProps, withState } from "recompose";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import { Checkbox } from "react-bootstrap";
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
  saveBlocksMutation(): () => {};
  exportSelection(blockId?: string): void;
  removeExportOfSelection(blockId?: string): void;
  onKeyDown(event: any): () => {};
}

interface BlockEditorEditingPresentationalState {
  hasChangedSinceDatabaseSave: boolean;
  shouldAutoSquareBracketExport: boolean;
}
export class BlockEditorEditingPresentational extends React.Component<
  BlockEditorEditingPresentationalProps,
  BlockEditorEditingPresentationalState
> {
  public editor;
  private autosaveInterval: any;

  private handleBlur = _.debounce(() => {
    if (this.props.shouldAutosave) {
      this.considerSaveToDatabase();
      this.endAutosaveInterval();
    }
  });

  public constructor(props: any) {
    super(props);
    this.state = {
      hasChangedSinceDatabaseSave: false,
      shouldAutoSquareBracketExport: true,
    };
  }

  public shouldComponentUpdate(newProps: BlockEditorEditingPresentationalProps, newState: BlockEditorEditingPresentationalState) {
    if (
      !_.isEqual(newProps.blockEditor, this.props.blockEditor) ||
      !_.isEqual(newProps.availablePointers, this.props.availablePointers) ||
      !_.isEqual(newProps.block, this.props.block) ||
      !_.isEqual(newProps.mutationStatus, this.props.mutationStatus) ||
      !_.isEqual(
        newState.shouldAutoSquareBracketExport,
        this.state.shouldAutoSquareBracketExport
      ) ||
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

    const underlyingDOMNode = this.editor && findDOMNode(this.editor.value.document);
    if (underlyingDOMNode && this.props.cyAttributeName) {
      underlyingDOMNode.setAttribute("data-cy", this.props.cyAttributeName);
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
        <div
          style={{
            alignItems: "center",
            display: "flex",
            height: "20px",
          }}
        >
          <Checkbox 
            checked={this.state.shouldAutoSquareBracketExport}
            inline={true}
            onChange={() => this.setState({ shouldAutoSquareBracketExport: !this.state.shouldAutoSquareBracketExport }, () => {
                if (this.state.shouldAutoSquareBracketExport) {
                  this.handleSquareBracketExport();
                }
            })}
          >
            auto export
          </Checkbox>
        </div>
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
          ref={this.updateEditor}
        />
      </div>
    );
  }

  // returns true if we should prevent current character from being inserted
  // returns false if this character should be inserted
  private checkAutocomplete = event => {
    const lastCharacters = lastCharactersAfterEvent(event, 5);
    const pointerNameMatch = lastCharacters.match(DOLLAR_NUMBERS_NOT_NUMBER);

    let shouldPreventCharInsertion = false;

    if (pointerNameMatch) {
      if (event.key === "Enter") {
        this.handlePointerNameAutocomplete(pointerNameMatch);
        shouldPreventCharInsertion = true;
      } else {
        this.handlePointerNameAutocomplete(pointerNameMatch);
      }
    }

    return shouldPreventCharInsertion;
  };

  private handlePointerNameAutocomplete = match => {
    const matchNumber = Number(match[0].substring(1, match[0].length - 1));
    const pointer = this.props.availablePointers[matchNumber - 1];

    if (!!pointer) {
      const { value } = this.props.value
        .change()
        .deleteBackward(matchNumber.toString().length + 1)
        .insertInline(inlinePointerImportJSON(pointer.data.pointerId))
        .collapseToStartOfNextText()
        .focus();

      this.onChange(value, true);
    }
  };

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

    const shouldPreventDefault = this.checkAutocomplete(event);
    if (shouldPreventDefault) {
      return false;
    }

    if (!!this.props.onKeyDown) {
      this.props.onKeyDown(event);
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
    if (this.state.shouldAutoSquareBracketExport) {
      this.handleSquareBracketExport();
    }
  };

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
