import {IState, IAction} from './'
export const ACTION_TYPES = {
    Load_Drug_Prediction: 'Load_Drug_Prediction', 
}


const rootReducer = (state:IState, action: IAction): IState=> {

    switch(action.type){
      case ACTION_TYPES.Load_Drug_Prediction: {
        return {...state, ...action.payload}
      }
      default:
        return state
    }
  }



export default rootReducer