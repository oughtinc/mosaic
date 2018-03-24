export const ADD_BLOCKS = "ADD_BLOCKS";
export const UPDATE_BLOCK = "UPDATE_BLOCK";

// This is an action creator
export const addBlocks = (blocks) => {
  // The returned object is an action
  return (dispatch, getState) => {
    dispatch({
      type: ADD_BLOCKS,
      blocks, 
    });
  };
};

export const updateBlock = ({ id, value, pointerChanged }) => {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_BLOCK,
      id, 
      value,
      pointerChanged,
    });
  };
};

export const saveBlocks = ({ ids, updateBlocksFn }) => {
  return async (dispatch, getState) => {
    const state = await getState();
    const _blocks = ids.map((id) => state.blocks.blocks.find((b) => b.id === id));
    const savingValues = _blocks.map((b) => ({id: b.id, value: b.value.toJSON() }));
    // console.log("Found block", _block);
    updateBlocksFn(savingValues);
  };
};
