import { IState, IAction } from 'types';
import { ACTION_TYPES } from 'stores/actions';

const rootReducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ACTION_TYPES.Load_Drug_Options:
    case ACTION_TYPES.Load_Disease_Options:
    case ACTION_TYPES.Load_Node_Types:
    case ACTION_TYPES.Load_Edge_Types:
    case ACTION_TYPES.Change_Disease:
    case ACTION_TYPES.Change_Drug:
    case ACTION_TYPES.Load_Node_Name_Dict:
    case ACTION_TYPES.Set_Loading_Status:
    case ACTION_TYPES.Select_Path_Noes:
    case ACTION_TYPES.Change_Edge_THR: {
      return { ...state, ...action.payload };
    }

    case ACTION_TYPES.Load_Attention_Pair: {
      return {
        ...state,
        attention: action.payload.attention,
        metaPathGroups: action.payload.metaPathGroups,
      };
    }

    default:
      return state;
  }
};

export default rootReducer;
