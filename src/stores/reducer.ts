import {IState, IAction, IMetaPath, IEdgeTypes, IAttentionTree} from 'types'
import {ACTION_TYPES} from 'stores/actions'


const rootReducer = (state:IState, action: IAction): IState=> {

    switch(action.type){
      case ACTION_TYPES.Load_Drug_Prediction: 
      case ACTION_TYPES.Load_Node_Types: 
      case ACTION_TYPES.Load_Edge_Types: 
      case ACTION_TYPES.Load_Attention:
      case ACTION_TYPES.Change_Disease:
      case ACTION_TYPES.Change_Drug:
      case ACTION_TYPES.Change_Edge_THR: {
        return {...state, ...action.payload}
      }


      case ACTION_TYPES.Load_Meta_Paths: {
        return {...state, metaPaths: parseMetaPaths(action.payload.metaPaths, state.edgeTypes, state.edgeThreshold)}
      }
     
      default:
        return state
    }
  }



  const parseMetaPaths = (res:any, edgeTypes: IEdgeTypes, edgeTHR: number): IMetaPath[]=>{
    let paths:IMetaPath[] = []
    Object.values(res).forEach((d:any)=>{
        let {node_type:startNode, layer1_score, layer0_score} = d
        
        Object.keys(layer1_score).forEach((edge1:string)=>{
            let firstNodes = [...edgeTypes[edge1].nodes]
            firstNodes.splice( firstNodes.indexOf(startNode), 1)
            let node1 = firstNodes[0],
                score1 = layer1_score[edge1]

            Object.keys(layer0_score[edge1]).forEach((edge0:string)=>{
                let secondNodes = [...edgeTypes[edge0].nodes]
                secondNodes.splice( secondNodes.indexOf(node1), 1)
                let node0 = secondNodes[0],
                    score0 = layer0_score[edge1][edge0]

                let metaPath: IMetaPath = {
                    edges: [
                        {edgeInfo: edgeTypes[edge1].edgeInfo, score: score1},
                        {edgeInfo: edgeTypes[edge0].edgeInfo, score: score0}
                    ],
                    nodes: [startNode, node1, node0]
                }
                if (score1>edgeTHR && score0 > edgeTHR){
                    paths.push(metaPath)
                }
                
            })
        })


    })
    return paths
}

const attentionRow2Tree = (edgeTypes: IEdgeTypes, row:{node_type:string, node_id: number, layer1: any[], layer0: any})=>{
  let tree: IAttentionTree = {
      node: `${row.node_type}_${row.node_id}`,
      score:1,
      edgeInfo: '',
      children: []
  }

  row.layer1.forEach((item1, idx1:number)=>{
      let [childNode1, score1, edgeKey1] = item1
      tree.children.push({
          node: childNode1,
          score: score1,
          edgeInfo: edgeTypes[edgeKey1].edgeInfo,
          children: []
      })
      row.layer0[childNode1].forEach((item0:any, idx0:number)=>{
          let [childNode0, score0, edgeKey0] = item0
          tree.children[idx1].children.push({
              node: childNode0,
              score: score0,
              edgeInfo: edgeTypes[edgeKey0].edgeInfo,
              children: []
          })
      })
  })
  return tree
}


export default rootReducer