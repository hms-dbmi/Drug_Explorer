import {IState, IAction} from './'
import {ACTION_TYPES} from 'stores/actions'


const rootReducer = (state:IState, action: IAction): IState=> {

    switch(action.type){
      case ACTION_TYPES.Load_Drug_Prediction: {
        return {...state, ...action.payload}
      }
      case ACTION_TYPES.Load_Node_Types: {
        return {...state, ...action.payload}
      }
      default:
        return state
    }
  }



export default rootReducer