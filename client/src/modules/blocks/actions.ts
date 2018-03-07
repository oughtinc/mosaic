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

export const updateBlock = ({id, value}) => {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_BLOCK,
      id, 
      value,
    });
  };
};