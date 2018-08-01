import * as React from "react";
import styled from "styled-components";
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
import { exportSelection } from "../../modules/blockEditor/actions";
import * as _ from "lodash";
import { UPDATE_BLOCKS } from "../../graphqlQueries";

const BlockEditorStyle = styled.div`
  background: #f4f4f4;
  border-radius: 2px;
  border: 1px solid #d5d5d5;
  margin-bottom: 1em;
  padding: 0.3em;
`;

const AUTOSAVE_EVERY_N_SECONDS = 3;
const DOLLAR_NUMBER_SPACE = /\$[0-9]+\s/;

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
  block: any;
  availablePointers: any[];
  value: any;
  mutationStatus: any;
  blockEditor: any;
  plugins: any[];
  shouldAutosave: boolean;
  onMount(value: any): () => {};
  updateBlock(value: any): () => {};
  onChange(value: any): () => boolean;
  saveBlocksMutation(): () => {};
  exportSelection(): () => {};
  onKeyDown(event: any): () => {};
}

interface BlockEditorEditingPresentationalState {
  hasChangedSinceDatabaseSave: boolean;
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
      )
    ) {
      return true;
    }
    return false;
  }

  public componentWillMount() {
    this.props.onMount(this);
  }

  public componentWillUnmount() {
    this.considerSaveToDatabase();
    this.endAutosaveInterval();
  }

  public componentDidUpdate(prevProps: any) {
    const oldDocument = prevProps.block.value.document;
    const newDocument = this.props.block.value.document;

    if (!oldDocument.equals(newDocument)) {
      this.onValueChange();
    }
  }

  public normalizeChangeWrtTextNodeSpacing(c) {
    const value = c.value;

    let changedOccured = false;

    function directlyBeforeExport(textNode) {
      return value.document.getNextSibling(textNode.key) && value.document.getNextSibling(textNode.key).type === 'pointerExport';
    }

    function directlyAfterExport(textNode) {
      return value.document.getPreviousSibling(textNode.key) && value.document.getPreviousSibling(textNode.key).type === 'pointerExport';
    }

    function insideExport(textNode) {
      return value.document.getParent(textNode.key) && value.document.getParent(textNode.key).type === 'pointerExport';
    }

    function firstCharIsSpace(textNode) {
      return textNode.text.charAt(0) === ' ';
    }

    function lastCharIsSpace(textNode) {
      return textNode.text.charAt(textNode.text.length - 1) === ' ';
    }

    value.document.getTexts().forEach(textNode => {
      if (!insideExport(textNode) && directlyBeforeExport(textNode) && !lastCharIsSpace(textNode)) {
        c.insertTextByKey(textNode.key, textNode.text.length, ' ');
      }

      if (!insideExport(textNode) && directlyAfterExport(textNode) && !firstCharIsSpace(textNode)) {
        c.insertTextByKey(textNode.key, 0, ' ');
      }

      if (insideExport(textNode) && !firstCharIsSpace(textNode)) {
        c.insertTextByKey(textNode.key, 0, ' ');
      }

      if (insideExport(textNode) && !lastCharIsSpace(textNode)) {
        c.insertTextByKey(textNode.key, textNode.text.length, ' ');
      }

      // for edge case where there is only two spaces in a pointer
      // and you delete one, then first and last char are both spaces
      // since they are the same char, so you need to additionaly enforce
      // that there are at least two chars
      if (insideExport(textNode) && textNode.text.length === 1) {
        c.insertTextByKey(textNode.key, 0, ' ');
      }
    });

    return c;
  }

  public componentDidMount() {
    const change = this.normalizeChangeWrtTextNodeSpacing(this.props.block.value.change());
    this.props.updateBlock({ id: this.props.block.id, value: change.value, pointerChanged: false });
  }

  public render() {
    return (
      <BlockEditorStyle>
        <MenuBar
          blockEditor={this.props.blockEditor}
          onAddPointerImport={this.onAddPointerImport}
          availablePointers={this.props.availablePointers}
          mutationStatus={this.props.mutationStatus}
          hasChangedSinceDatabaseSave={this.state.hasChangedSinceDatabaseSave}
        />
        <Editor
          value={this.props.value}
          onChange={this.onChangeCallback}
          plugins={this.props.plugins}
          spellCheck={false}
          onBlur={this.handleBlur}
          onKeyDown={this.onKeyDown}
          ref={this.updateEditor}
        />
      </BlockEditorStyle>
    );
  }

  private checkAutocomplete = event => {
    const lastCharacters = lastCharactersAfterEvent(event, 4);
    const pointerNameMatch = lastCharacters.match(DOLLAR_NUMBER_SPACE);
    if (pointerNameMatch) {
      this.handlePointerNameAutocomplete(
        lastCharacters,
        pointerNameMatch,
        event
      );
    }
  };

  private handlePointerNameAutocomplete = (characters, match, event) => {
    const matchNumber = Number(match[0].substring(1, match[0].length - 1));
    const pointer = this.props.availablePointers[matchNumber - 1];

    if (!!pointer) {
      const { value } = this.props.value
        .change()
        .deleteBackward(matchNumber.toString().length + 1)
        .insertInline(inlinePointerImportJSON(pointer.data.pointerId))
        .collapseToStartOfNextText()
        .focus()
        .insertText(" ");

      this.onChange(value, true);
      event.preventDefault();
    }
  };

  private onKeyDown = (event, change) => {

    let value = change.value;
    let changeValue = change;

    const movingLeft = event.key === 'ArrowLeft' || event.key === 'Backspace';
    const movingRight = event.key === 'ArrowRight';
    if (movingLeft) changeValue = value.change().move(-1);
    if (movingRight) changeValue = value.change().move(1);

    const textNode = changeValue.value.document.getNode(value.selection.focusKey);
    const nextTextNode = value.document.getNextText(textNode.key);
    const prevTextNode = value.document.getPreviousText(textNode.key);

    const focusOffsetAtStart = changeValue.value.selection.focusOffset === 0;
    const focusOffsetAtEnd = changeValue.value.selection.focusOffset === textNode.characters.size;

    if (focusOffsetAtStart && movingLeft && prevTextNode) {
      changeValue
        .moveToRangeOf(prevTextNode)
        .collapseToEnd()
        .move(-1);
      this.props.updateBlock({ id: this.props.block.id, value: changeValue.value, pointerChanged: false });
      event.preventDefault();
      return false;
    }

    if (focusOffsetAtEnd && movingRight && nextTextNode) {
      changeValue
        .moveToRangeOf(nextTextNode)
        .collapseToStart()
        .move(1);
      this.props.updateBlock({ id: this.props.block.id, value: changeValue.value, pointerChanged: false });
      event.preventDefault();
      return false;
    }

    const pressedControlAndE = _event => _event.metaKey && _event.key === "e";
    if (pressedControlAndE(event)) {
      this.props.exportSelection();
      event.preventDefault();
    }
    this.checkAutocomplete(event);
    if (!!this.props.onKeyDown) {
      this.props.onKeyDown(event);
    }

    // because false is sometimes return in this function
    // all paths need to explicitly return or the linter raises an error
    return;
  };

  private onValueChange = () => {
    const changeFromOutsideComponent = this.props.block.pointerChanged;

    if (this.props.shouldAutosave) {
      if (changeFromOutsideComponent) {
        this.saveToDatabase();
      } else {
        this.beginAutosaveInterval();
        this.setState({ hasChangedSinceDatabaseSave: true });
      }
    }
  };

  private onChangeCallback = (c: any) => {
    // first check to see if document changed, which we can do with !== b/c
    // Slate uses immutable objects, if it has changed then normalize wrt
    // pointer spacing
    if (c.value.document !== this.props.block.value.document) {
      c = this.normalizeChangeWrtTextNodeSpacing(c);
    }

    // the rest of this method before the last two lines are trying to prevent
    // the user from using a click top get the text cursor in off limit spacing
    // the onClick handler didn't seem to have access to the new cursor position
    // so this logic lives here instead

    const value = c.value;
    const selection = value.selection;

    const anchorKey = selection.anchorKey;
    const focusKey = selection.focusKey;
    const anchorOffset = selection.anchorOffset;
    const focusOffset = selection.focusOffset;


    const selectionIsExpanded = (anchorKey !== focusKey) || (anchorOffset !== focusOffset);

    // if selection is expanded, then we don't do this
    // this allows mouse dragging to select across pointers
    if (!selectionIsExpanded) {
      const textNode = value.document.getNode(focusKey);
      const focusOffsetAtStart = focusOffset === 0;
      const focusOffsetAtEnd = focusOffset === textNode.characters.size;
      const nextTextNode = value.document.getNextText(textNode.key);
      const prevTextNode = value.document.getPreviousText(textNode.key);

      if (focusOffsetAtStart && prevTextNode) {
        c.moveToRangeOf(prevTextNode)
          .collapseToEnd()
          .move(-1);
        this.props.updateBlock({ id: this.props.block.id, value: c.value, pointerChanged: false });
      }

      if (focusOffsetAtEnd && nextTextNode) {
        c.moveToRangeOf(nextTextNode)
          .collapseToStart()
          .move(1);
        this.props.updateBlock({ id: this.props.block.id, value: c.value, pointerChanged: false });
      }
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

  private onAddPointerImport = (pointerId: string) => {
    const { value } = this.props.value
      .change()
      .insertInline(inlinePointerImportJSON(pointerId));
    this.onChange(value, true);
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
    { updateBlock, exportSelection },
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
