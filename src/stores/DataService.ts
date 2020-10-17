
import axios from "axios"

type TDrugNames = string[]
type TDrugIDs = string[]
type TRankList = { [listName: string]: number[] }

export interface IDrugPredictions {
    drugNames: string[],
    drugIDs: string[],
    rankList: {
        [listname: string]: number[]
    },
    isPredictionLoaded: boolean,
}


const requestPredictions = (async (url: string='./data/predictions/drug-rankings.tsv', maxRank: number = 50): Promise<IDrugPredictions> => {
    let res = await axios.get(url)
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
    return {rankList, drugIDs, drugNames, isPredictionLoaded: true}

})

export { requestPredictions } 