export const ADD_BLOCKS = "ADD_BLOCKS";
export const UPDATE_BLOCK = "UPDATE_BLOCK";

// This is an action creator
export const addBlocks = (blocks) => {
  // The returned object is an action
  return {
    // 'type' is a required field for an action, 
    // specifying the type of action being performed
    type: ADD_BLOCKS,
    blocks, 
  };
};

export const updateBlock = ({id, value}) => {
  return {
    // 'type' is a required field for an action, 
    // specifying the type of action being performed
    type: UPDATE_BLOCK,
    id, 
    value,
  };
};