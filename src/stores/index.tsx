import React, { createContext } from 'react';
import rootReducer from './reducer'
import {IMetaPath, IEdgeType} from 'types'



export interface IState {
    edgeThreshold: number
    nodeTypes: string[],
    edgeTypes: IEdgeType,
    metaPahts: {
      [key:string]: IMetaPath
    }
}




export type IAction = any 

const initialState: IState = {
  nodeTypes:[],
  edgeTypes: {},
  metaPahts:{},
  edgeThreshold: 0.4
}

interface IStateContext {
  state: IState;
  dispatch: ({type}:{type:string}) => void;
}

const GlobalStore = createContext({} as IStateContext);

// An wrapping function to handle thunks (dispatched actions which are wrapped in a function, needed for async callbacks)
const asyncer = (dispatch: any, state: IState) => (action: any) =>
    typeof(action) === 'function' ? action(dispatch, state) : dispatch(action);

 

// The StateProvider component to provide the global state to all child components
export function StateProvider(props: any) {
  const [state, dispatchBase] = React.useReducer(rootReducer, initialState);

  const dispatch = React.useCallback(asyncer(dispatchBase, state), [])

  return <GlobalStore.Provider value={{ state, dispatch }}>
          { props.children }
      </GlobalStore.Provider>
}
  
export function StateConsumer(Component: any) {
  return function WrapperComponent(props: any) {
      return (
          <GlobalStore.Consumer>
              {context => <Component {...props} globalState={context.state} dispatch={context.dispatch} />}
          </GlobalStore.Consumer>
      );
  }
}


export {ACTION_TYPES} from 'stores/actions'

