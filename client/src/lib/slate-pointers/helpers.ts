import * as _ from "lodash";

export function propsToPointerDetails({ blockEditor, availablePointers, nodeAsJson }: any) {
    const { internalReferenceId, pointerId } = nodeAsJson.data;
    const reference = blockEditor.pointerReferences[internalReferenceId];
    const isSelected = blockEditor.hoveredItem.id === internalReferenceId;
    const isOpen = reference && reference.isOpen;
    const importingPointer: any = availablePointers.find((l: any) => l.data.pointerId === pointerId);
    const pointerIndex = _.findIndex(availablePointers, (l: any) => l.data.pointerId === pointerId);
    return ({ importingPointer, isSelected, isOpen, pointerIndex });
}
