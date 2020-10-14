import React, {useState} from "react"
import axios from "axios"

type TDrugNames = string[]
type TDrugIDs = string[]
type TRankList = {[listName:string]:number[]}

interface IState {
    drugNames: string[],
    drugIDs: string[],
    rankList: {
        [listname: string]: number[]
    },
    isLoading: boolean,
}

const initialPredictionState = {
    drugNames: [],
    drugIDs: [],
    rankList: {},
    isLoading: false
}

const PredictionLoader= (()=>{
    const [state,setState] = useState(initialPredictionState as IState)
    
    const loadPredictions = ((url:string, maxRank:number=50)=>{
        setState({...state, isLoading: true})
        return axios.get(url)
            .then(res => {
                let response = res.data
                let lines = response.split('\n')

                let rankNames: string[] = lines[0].split('\t').slice(2),
                    drugNames: TDrugNames = [],
                    drugIDs: TDrugIDs = [],
                    rankList: TRankList = {}

                rankNames.forEach(name => {
                    rankList[name] = []
                })

                for (let i = 1; i < maxRank; i++) {
                    let cells = lines[i].split('\t')
                    drugIDs.push(cells[0])
                    drugNames.push(cells[1])
                    cells.slice(2).forEach(
                        (rank: number, i: number) => rankList[rankNames[i]].push(rank)
                    )
                }

                setState({
                    drugIDs,
                    drugNames, 
                    rankList,
                    isLoading: false
                })

               
            })
    })
    return {state, loadPredictions}
})

export {PredictionLoader} 