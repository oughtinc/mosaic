export const ADD_BLOCKS = "ADD_BLOCKS";
export const UPDATE_BLOCK = "UPDATE_BLOCK";
export const REMOVE_BLOCKS = "REMOVE_BLOCKS";
export const RESET_BLOCK = "RESET_BLOCK";

// This is an action creator
export const addBlocks = blocks => {
  // The returned object is an action
  return (dispatch, getState) => {
    dispatch({
      type: ADD_BLOCKS,
      blocks,
    });
  };
};

export const removeBlocks = blockIds => {
  return (dispatch, getState) => {
    dispatch({
      type: REMOVE_BLOCKS,
      blockIds,
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

export const resetBlock = ({ id }) => {
  return {
    type: RESET_BLOCK,
    id,
  };
};

export const saveBlocks = ({ ids, updateBlocksFn }) => {
  return async (dispatch, getState) => {
    const state = await getState();
    const _blocks = ids.map(id => state.blocks.blocks.find(b => b.id === id));
    const savingValues = _blocks.map(b => ({
      id: b.id,
      value: b.value.toJSON(),
    }));
    updateBlocksFn(savingValues);
  };
};
