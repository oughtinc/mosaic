export const extractPointerIdsFromQuestionValue = questionValue => {
  const nodes = questionValue[0].nodes;
  let firstExport, secondExport;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === "pointerImport" || node.type === "pointerExport") {
      if (!firstExport) {
        firstExport = node.data.pointerId;
      } else {
        secondExport = node.data.pointerId;
      }
    }
  }

  return [firstExport, secondExport];
};
