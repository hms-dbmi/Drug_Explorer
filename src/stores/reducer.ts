import { IState, IAction, IMetaPathSummary } from 'types';
import { ACTION_TYPES } from 'stores/actions';

const rootReducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ACTION_TYPES.Load_Drug_Options:
      return {
        ...state,
        drugPredictions: action.payload.drugPredictions,
        metaPathSummary: action.payload.metaPathSummary.map(
          (d: IMetaPathSummary, idx: number) => {
            return { ...d, hide: false, idx };
          }
        ),
      };

    case ACTION_TYPES.Load_Disease_Options:
      return { ...state, diseaseOptions: action.payload.diseaseOptions };

    case ACTION_TYPES.Load_Node_Types:
      return { ...state, nodeTypes: action.payload.nodeTypes };

    case ACTION_TYPES.Load_Edge_Types:
      return { ...state, edgeTypes: action.payload.edgeTypes };

    case ACTION_TYPES.Change_Disease:
      return { ...state, selectedDisease: action.payload.selectedDisease };

    case ACTION_TYPES.Change_Drug:
      return {
        ...state,
        selectedDrugs: [
          ...state.selectedDrugs,
          ...action.payload.selectedDrugs,
        ],
      };

    case ACTION_TYPES.Load_Node_Name_Dict:
      return { ...state, nodeNameDict: action.payload.nodeNameDict };

    case ACTION_TYPES.Set_Loading_Status:
      return { ...state, ...action.payload };

    case ACTION_TYPES.Select_Path_Noes:
      return { ...state, selectedPathNodes: action.payload.selectedPathNodes };

    case ACTION_TYPES.Change_Edge_THR: {
      return { ...state, edgeThreshold: action.payload.edgeThreshold };
    }

    case ACTION_TYPES.Toggle_Meta_Path_Hide: {
      return { ...state, metaPathSummary: action.payload.metaPathSummary };
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
