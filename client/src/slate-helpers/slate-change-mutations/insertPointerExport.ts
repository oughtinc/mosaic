import * as uuidv1 from "uuid/v1";
import { Change } from "../../components/BlockEditor/types";
import * as slateChangeMutations from "../../slate-helpers/slate-change-mutations";
import { isSelectionAcrossPointers } from "../slate-utils/isSelectionAcrossPointers";

const onlyOneNodeThatIsPointerExport = nodes => {
  return (
    nodes.length === 1
    &&
    nodes[0].type === "pointerExport"
  );
};

const twoNodesFirstExportSecondEmptyString = nodes => {
  return (
    nodes.length === 2
    &&
    nodes[0].type === "pointerExport"
    &&
    nodes[1].object === "text"
    && nodes[1].leaves[0].text === ""
  );
};

export function insertPointerExport(change: Change) {
  const initialFragment = change.value.fragment;
  const initialTopLevelNodes = initialFragment.nodes.toJSON()[0].nodes;

  const isNestedInPointerExport =
    onlyOneNodeThatIsPointerExport(initialTopLevelNodes)
    ||
    twoNodesFirstExportSecondEmptyString(initialTopLevelNodes);

  // if we are exporting a nested pointer, guarantee that the selection is
  // not extending to an edge, because selections on the edge of an inline
  // pick up what comes after
  if (isNestedInPointerExport) {
    slateChangeMutations.moveSelectionAwayFromPointerEdge(change);
  }

  // disallow attempts to export across pointer boundaries
  const selection = change.value.selection;
  const document = change.value.document;
  const isExportingAcrossPointers = isSelectionAcrossPointers(selection, document);
  if (isExportingAcrossPointers) {
    return;
  }

  // A Slate fragment is a document: value.fragment is the document
  // encompassing the currently selected portion of the editor.
  // If the user has selected part of a deeply nested node, then the
  // associated fragment will include all levels of the nesting.
  // The next few lines (until the end of the while loop) drill down
  // through such a nested document to unnest all the nodes that are
  // selected.
  const maybeChangedFragment = change.value.fragment;
  const maybeChangedTopLevelNodes = maybeChangedFragment.nodes.toJSON()[0].nodes;

  let nodes = maybeChangedTopLevelNodes;
  while (onlyOneNodeThatIsPointerExport(nodes)) {
    nodes = nodes[0].nodes;
  }

  const uuid = uuidv1();
  change.insertInline({
    type: "pointerExport",
    data: { pointerId: uuid },
    nodes,
  });
}
