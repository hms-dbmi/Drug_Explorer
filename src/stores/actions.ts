import { IDispatch } from 'types';
import { requestAttention, requestDrugPredictions } from 'stores/DataService';

export const ACTION_TYPES = {
  Load_Node_Types: 'Load_Node_Types',
  Load_Edge_Types: 'Load_Edge_Types',
  Load_Meta_Paths: 'Load_Meta_Paths',
  Load_Attention: 'Load_Attention',
  Load_Node_Name_Dict: 'Load_Node_Name_Dict',
  Load_Drug_Options: 'Load_Drug_Options',
  Load_Disease_Options: 'Load_Disease_Options',

  Set_Loading_Status: 'Set_Loading_Status',

  Change_Edge_THR: 'Change_Edge_THR',
  Change_Drug: 'Change_Drug',
  Change_Disease: 'Change_Disease',
  Select_Path_Noes: 'Select_Path_Nodes',
};

export const changeDrug = (selectedDrug: string, dispatch: IDispatch) => {
  dispatch({
    type: ACTION_TYPES.Change_Drug,
    payload: { selectedDrug },
  });
};

export const changeDisease = (selectedDisease: string, dispatch: IDispatch) => {
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
      const {
        predictions: drugPredictions,
        metapathSummary: metaPathSummary,
      } = res;
      dispatch({
        type: ACTION_TYPES.Load_Edge_Types,
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

export const queryAttention = (
  selectedDrug: string | undefined,
  selectedDisease: string | undefined,
  dispatch: IDispatch
) => {
  if (selectedDrug !== undefined && selectedDisease !== undefined) {
    dispatch({
      type: ACTION_TYPES.Set_Loading_Status,
      payload: { isAttentionLoading: true },
    });

    requestAttention(selectedDisease, selectedDrug)
      .then((attention) => {
        dispatch({
          type: ACTION_TYPES.Load_Attention,
          payload: { attention },
        });
      })
      .then(() => {
        dispatch({
          type: ACTION_TYPES.Set_Loading_Status,
          payload: { isAttentionLoading: false },
        });
      });
  }
};
