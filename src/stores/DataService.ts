
import axios from "axios"
import { UMAP } from 'umap-js';
import TSNE from 'tsne-js';

type TDrugNames = string[]
type TDrugIDs = string[]
type TRankList = { [listName: string]: number[] }

export interface IDrugPredictions {
    drugNames: string[],
    drugIDs: string[],
    rankList: {
        [listname: string]: number[]
    },
    embeddings: {value: number[], drugName:string, drugID: string}[],
    embeddingRef: {[name:string]:number[]}
    isPredictionLoaded: boolean,

}


const requestPredictions = (async (maxRank: number = 50): Promise<IDrugPredictions> => {
    // load drug ranking list

    let rankingRes = await axios.get('./data/predictions/drug-rankings.tsv')
    let response = rankingRes.data
    let lines = response.split('\n')

    let rankNames: string[] = lines[0].split('\t').slice(2),
        drugNames: TDrugNames = [],
        drugIDs: TDrugIDs = [],
        rankList: TRankList = {}

    rankNames.forEach(name => {
        rankList[name] = []
    })

    for (let i = 1; i < lines.length; i++) {
        let cells = lines[i].split('\t')
        drugIDs.push(cells[0])
        drugNames.push(cells[1])
        cells.slice(2).forEach(
            (rank: number, i: number) => rankList[rankNames[i]].push(rank)
        )
    }

    // load drug embedding
    let embeddingRes = await axios.get('./data/predictions/drug-embeddings.csv')
    let embeddings: IDrugPredictions['embeddings']= []
    let embeddingRef:IDrugPredictions['embeddingRef'] = {
        'A1': [...Array(maxRank)].map(_=>0),
        'A2': [...Array(maxRank)].map(_=>0),
        'A3': [...Array(maxRank)].map(_=>0),
        'A4': [...Array(maxRank)].map(_=>0),
        'acRank': [...Array(maxRank)].map(_=>0),
    }

    embeddingRes.data.split('\n').forEach((line: string) => {
        let cells = line.split(',')
        let drugID = cells.shift() as string,
            idx = drugIDs.indexOf(drugID),
            drugName = drugNames[idx]

        let isIncluded:boolean = false

        Object.keys(embeddingRef).forEach(rankName => {
            let rank = rankList[rankName][idx]
            if (rank < maxRank) {
                embeddingRef[rankName][rank-1] = embeddings.length
                isIncluded = true
            }           
        });

        if (isIncluded){
            embeddings.push( {value: cells.map(d => parseFloat(d)), drugID, drugName } )
        }
        
    })

    // dimension reduction using UMAP
    function cosinesim(A:number[],B:number[]){
        var dotproduct=0;
        var mA=0;
        var mB=0;
        for(let i = 0; i < A.length; i++){ 
            dotproduct += (A[i] * B[i]);
            mA += (A[i]*A[i]);
            mB += (B[i]*B[i]);
        }
        mA = Math.sqrt(mA);
        mB = Math.sqrt(mB);
        var similarity = (dotproduct)/((mA)*(mB)) // here you needed extra brackets
        return similarity;
    }

    const umap = new UMAP({
        nComponents: 2,
        // nEpochs: 400,
        nNeighbors: 10,
        minDist: 0.25,
        // spread:1,
        // random: ()=>0.3,
        distanceFn: cosinesim
      })
    let embeddingUMAP = await umap.fitAsync(embeddings.map(d=>d.value))

    // // dimension reduction using tsne
    // let model = new TSNE({
    //     dim: 2,
    //     perplexity: 30.0,
    //     earlyExaggeration: 4.0,
    //     learningRate: 100.0,
    //     nIter: 1000,
    //     metric: 'cosine'
    //   });
      
    //   // inputData is a nested array which can be converted into an ndarray
    //   // alternatively, it can be an array of coordinates (second argument should be specified as 'sparse')
    //   model.init({
    //     data: embeddings,
    //     type: 'dense'
    //   });
      
      
    //   // `outputScaled` is `output` scaled to a range of [-1, 1]
    // let embeddingTSNE = model.getOutputScaled();

    drugIDs = drugIDs.slice(0, maxRank)
    drugNames = drugNames.slice(0, maxRank)

    embeddings = embeddings.map((d, i)=>{return {...d, value: embeddingUMAP[i]}})

    return { rankList, drugIDs, drugNames, embeddings, embeddingRef, isPredictionLoaded: true }

})

export { requestPredictions } 