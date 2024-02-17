import { IState, IAction, IMetaPathSummary, IMetaPath } from 'types';
import { ACTION_TYPES } from 'stores/actions';

const rootReducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ACTION_TYPES.Load_Drug_Options:
      return {
        ...state,
        drugPredictions: action.payload.drugPredictions,
      };

    case ACTION_TYPES.Load_Disease_Options:
      return { ...state, diseaseOptions: action.payload.diseaseOptions };

    case ACTION_TYPES.Load_Node_Types:
      return { ...state, nodeTypes: action.payload.nodeTypes };

    case ACTION_TYPES.Load_Edge_Types:
      return { ...state, edgeTypes: action.payload.edgeTypes };

    case ACTION_TYPES.Change_Disease:
      return {
        ...state,
        selectedDisease: action.payload.selectedDisease,
        attention: {},
        metaPathGroups: {},
        metaPathSummary: [],
        caseDescription: undefined,
      };

    case ACTION_TYPES.Change_Drug:
      return {
        ...state,
        drugPredictions: toggleDrugSelection(
          state.drugPredictions,
          action.payload.selectedDrug
        ),
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

    case ACTION_TYPES.Add_Attention_Paths: {
      return {
        ...state,
        attention: { ...state.attention, ...action.payload.attention },
        metaPathGroups: {
          ...state.metaPathGroups,
          ...action.payload.metaPathGroups,
        },
        metaPathSummary: updateMetaPathSummary(
          state.metaPathSummary,
          action.payload.metaPathGroups[action.payload.selectedDrug],
          action.payload.selectedDrug,
          true // whether add new drug
        ),
      };
    }

    case ACTION_TYPES.Update_Case_Description: {
      return { ...state, caseDescription: action.payload.caseDescription };
    }

    case ACTION_TYPES.Del_Attention_Paths: {
      // deep copy
      let attention = JSON.parse(JSON.stringify(state.attention)),
        metaPathGroups = JSON.parse(JSON.stringify(state.metaPathGroups));

      delete attention[`drug:${action.payload.selectedDrug}`];
      delete metaPathGroups[action.payload.selectedDrug];
      return {
        ...state,
        attention,
        metaPathGroups,
        metaPathSummary: updateMetaPathSummary(
          state.metaPathSummary,
          metaPathGroups[action.payload.selectedDrug],
          action.payload.selectedDrug,
          false // whether add new drug
        ),
      };
    }

    default:
      return state;
  }
};

const toggleDrugSelection = (
  drugPredictions: IState['drugPredictions'],
  selectedDrug: string
) => {
  return drugPredictions.map((d) => {
    return {
      ...d,
      selected: selectedDrug === d.id ? !d.selected : d.selected,
    };
  });
};

const updateMetaPathSummary = (
  oldSummary: IMetaPathSummary[],
  currentMetaPaths: IMetaPath[],
  drugId: number,
  isAdd: boolean
) => {
  let newSummary = oldSummary.map((d) => d);

  // if add new drug
  if (isAdd) {
    currentMetaPaths.forEach((metaPath) => {
      let count = metaPath.paths.length;
      let sharedMeta = newSummary.find(
        (d) => d.nodeTypes.join() === metaPath.nodeTypes.join()
      );
      if (sharedMeta) {
        // if shared meta path exists
        sharedMeta.count[drugId] = count;
        sharedMeta.sum += count;
      } else {
        // if shared meta path does not exist
        newSummary.unshift({
          nodeTypes: metaPath.nodeTypes,
          count: { [drugId]: count },
          sum: count,
          hide: false,
          expand: false,
          idx: newSummary.length,
        });
      }
    });
  } else {
    // if delete existing drug

    newSummary.forEach((metaPath) => {
      if (drugId in metaPath.count) {
        metaPath.sum -= metaPath.count[drugId];
        delete metaPath.count[drugId];
      }
    });
  }
  newSummary = newSummary.filter((d) => d.sum > 0);
  return newSummary;
};

export const isAddDrug = (
  drugPredictions: IState['drugPredictions'],
  drugID: string
) => {
  return !drugPredictions
    .filter((d) => d.selected)
    .map((d) => d.id)
    .includes(drugID);
};
export default rootReducer;
