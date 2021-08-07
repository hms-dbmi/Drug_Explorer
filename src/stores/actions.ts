import {
  DrugPrediction,
  IDispatch,
  IMetaPath,
  IMetaPathGroup,
  IMetaPathSummary,
} from 'types';
import {
  requestAttentionPair,
  requestDrugPredictions,
} from 'stores/DataService';

export const ACTION_TYPES = {
  Load_Node_Types: 'Load_Node_Types',
  Load_Edge_Types: 'Load_Edge_Types',
  Load_Meta_Paths: 'Load_Meta_Paths',
  Add_Attention_Paths: 'Add_Attention_Paths',
  Del_Attention_Paths: 'Del_Attention_Paths',
  Load_Node_Name_Dict: 'Load_Node_Name_Dict',
  Load_Drug_Options: 'Load_Drug_Options',
  Load_Disease_Options: 'Load_Disease_Options',

  Set_Loading_Status: 'Set_Loading_Status',

  Change_Edge_THR: 'Change_Edge_THR',
  Change_Drug: 'Change_Drug',
  Change_Disease: 'Change_Disease',
  Select_Path_Noes: 'Select_Path_Nodes',

  Toggle_Meta_Path_Hide: 'Toggle_Meta_Path_Hide',

  Go_Next: 'Go_Next',
  Go_Prev: 'Go_Prev',
};

export const selectDrug = (
  selectedDrug: string,
  selectedDisease: string | undefined,
  isAdd: boolean,
  dispatch: IDispatch
) => {
  if (selectedDisease) {
    changeDrug(selectedDrug, dispatch);
    modifyAttentionPaths(selectedDrug, selectedDisease, isAdd, dispatch);
  }
};

export const goNext = (dispatch: IDispatch) => {
  dispatch({
    type: ACTION_TYPES.Go_Next,
  });
};

export const goPrev = (dispatch: IDispatch) => {
  dispatch({
    type: ACTION_TYPES.Go_Prev,
  });
};

export const selectDisease = (selectedDisease: string, dispatch: IDispatch) => {
  dispatch({
    type: ACTION_TYPES.Set_Loading_Status,
    payload: { isDrugLoading: true },
  });

  dispatch({
    type: ACTION_TYPES.Change_Disease,
    payload: { selectedDisease },
  });

  dispatch({
    type: ACTION_TYPES.Change_Drug,
    payload: { selectedDrug: undefined },
  });

  requestDrugPredictions(selectedDisease)
    .then((res) => {
      const { predictions, metapathSummary: metaPathSummary } = res;
      const drugPredictions = predictions.map((d: DrugPrediction) => {
        return { ...d, selected: false };
      });
      dispatch({
        type: ACTION_TYPES.Load_Drug_Options,
        payload: { drugPredictions, metaPathSummary },
      });
    })
    .then(() => {
      dispatch({
        type: ACTION_TYPES.Set_Loading_Status,
        payload: { isDrugLoading: false },
      });
    });
};

const modifyAttentionPaths = (
  selectedDrug: string | undefined,
  selectedDisease: string | undefined,
  isAdd: boolean,
  dispatch: IDispatch
) => {
  if (selectedDrug !== undefined && selectedDisease !== undefined) {
    if (isAdd) {
      dispatch({
        type: ACTION_TYPES.Set_Loading_Status,
        payload: { isAttentionLoading: true },
      });

      requestAttentionPair(selectedDisease, selectedDrug)
        .then((res) => {
          dispatch({
            type: ACTION_TYPES.Add_Attention_Paths,
            payload: {
              attention: res.attention,
              metaPathGroups: { [selectedDrug]: groupMetaPaths(res.metapaths) },
            },
          });
        })
        .then(() => {
          dispatch({
            type: ACTION_TYPES.Set_Loading_Status,
            payload: { isAttentionLoading: false },
          });
        });
    } else {
      dispatch({
        type: ACTION_TYPES.Del_Attention_Paths,
        payload: {
          selectedDrug,
        },
      });
    }
  }
};

const changeDrug = (selectedDrug: string, dispatch: IDispatch) => {
  dispatch({
    type: ACTION_TYPES.Change_Drug,
    payload: { selectedDrug },
  });
};

const groupMetaPaths = (metaPaths: IMetaPath[]): IMetaPathGroup[] => {
  let groups: IMetaPathGroup[] = [];
  let groupDict: string[] = [];
  metaPaths.forEach((metaPath) => {
    metaPath.hide = false; // initi, show all metapaths
    const nodeTypeString = metaPath.nodes.map((d) => d.nodeType).join('_');
    const groupIdx = groupDict.indexOf(nodeTypeString);
    if (groupIdx > -1) {
      groups[groupIdx].metaPaths.push(metaPath);
    } else {
      groupDict.push(nodeTypeString);
      groups.push({
        nodeTypes: metaPath.nodes.map((d) => d.nodeType),
        metaPaths: [metaPath],
      });
    }
  });
  return groups;
};

export const toggleMetaPathHide = (
  metaPathSummary: IMetaPathSummary[],
  idx: number,
  hide: boolean,
  dispatch: IDispatch
) => {
  metaPathSummary[idx]['hide'] = hide;
  dispatch({
    type: ACTION_TYPES.Toggle_Meta_Path_Hide,
    payload: { metaPathSummary },
  });
};
