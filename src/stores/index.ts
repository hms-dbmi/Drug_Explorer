import React, { createContext, useContext, useReducer } from 'react';


interface IPredictionStore {
    drugNames: string[],
    drugIDs: string[],
    rankList: {
        [listname: string]: number[]
    },
    isLoading: boolean,
}

interface IStore extends IPredictionStore{
    
}

interface IAction {
    type: string,
}

const initialStore: IStore= {
    drugNames: [],
    drugIDs: [],
    rankList: {},
    isLoading: false
}


const StoreContext = createContext(initialStore);

const reducer = (store: IStore, action: IAction) => {
  switch(action.type) {
    case "increment":
      return {...initialStore}
    
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}


export const useStore = () => useContext(StoreContext);