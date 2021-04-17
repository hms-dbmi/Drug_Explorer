import {
  IState,
  IAction,
  IMetaPath,
  IEdgeTypes,
  IAttentionTree,
  IMetaPathGroup,
} from 'types';
import { ACTION_TYPES } from 'stores/actions';

import * as d3 from 'd3';
import { group } from 'd3';

const rootReducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case ACTION_TYPES.Load_Drug_Options:
    case ACTION_TYPES.Load_Disease_Options:
    case ACTION_TYPES.Load_Node_Types:
    case ACTION_TYPES.Load_Edge_Types:
    case ACTION_TYPES.Change_Disease:
    case ACTION_TYPES.Change_Drug:
    case ACTION_TYPES.Load_Node_Name_Dict:
    case ACTION_TYPES.Set_Attention_Loading_Status:
    case ACTION_TYPES.Change_Edge_THR: {
      return { ...state, ...action.payload };
    }

    case ACTION_TYPES.Load_Attention: {
      return {
        ...state,
        attention: action.payload.attention,
        metaPathGroups: parseMetaPaths(
          action.payload.attention,
          state.edgeTypes
        ),
      };
    }

    default:
      return state;
  }
};

// const parseMetaPaths = (res: any, edgeTypes: IEdgeTypes): IMetaPath[] => {
//   let paths: IMetaPath[] = [];
//   Object.values(res).forEach((d: any) => {
//     let { node_type: startNode, layer1_score, layer0_score } = d;

//     Object.keys(layer1_score || {}).forEach((edge1: string) => {
//       let firstNodes = [...edgeTypes[edge1].nodes];
//       firstNodes.splice(firstNodes.indexOf(startNode), 1);
//       let node1 = firstNodes[0],
//         score1 = layer1_score[edge1];

//       Object.keys(layer0_score[edge1]).forEach((edge0: string) => {
//         let secondNodes = [...edgeTypes[edge0].nodes];
//         secondNodes.splice(secondNodes.indexOf(node1), 1);
//         let node0 = secondNodes[0],
//           score0 = layer0_score[edge1][edge0];

//         let metaPath: IMetaPath = {
//           edges: [
//             { edgeInfo: edgeTypes[edge1].edgeInfo, score: score1 },
//             { edgeInfo: edgeTypes[edge0].edgeInfo, score: score0 },
//           ],
//           nodes: [startNode, node1, node0],
//         };
//         // if (score1>edgeTHR && score0 > edgeTHR){
//         //     paths.push(metaPath)
//         // }
//         paths.push(metaPath);
//       });
//     });
//   });
//   return paths;
// };

const parseMetaPaths = (
  attentions: { [key: string]: IAttentionTree },
  edgeTypes: IEdgeTypes
): IMetaPathGroup[] => {
  const leftTree = d3.hierarchy(attentions['disease']),
    rightTree = d3.hierarchy(attentions['drug']);
  const leftNodes = leftTree.descendants();
  const rightNodes = rightTree.descendants();
  let metaPaths: IMetaPath[] = [];

  const rightNodeIds = rightNodes.map((d) => d.data.nodeId);

  leftNodes.forEach((leftNode) => {
    const rightIdx = rightNodeIds.indexOf(leftNode.data.nodeId);
    if (rightIdx > -1) {
      let metaPath: IMetaPath = {
        edges: [],
        nodes: [
          { nodeType: leftNode.data.nodeType, nodeId: leftNode.data.nodeId },
        ],
      };
      let rightNode = rightNodes[rightIdx];
      while (leftNode.parent) {
        metaPath.edges.unshift({
          edgeInfo:
            edgeTypes[leftNode.data.edgeInfo.replace('rev_', '')]?.edgeInfo,
          score: leftNode.data.score,
        });

        leftNode = leftNode.parent;

        metaPath.nodes.unshift({
          nodeType: leftNode.data.nodeType,
          nodeId: leftNode.data.nodeId,
        });
      }

      while (rightNode.parent) {
        metaPath.edges.push({
          edgeInfo:
            edgeTypes[rightNode.data.edgeInfo.replace('rev_', '')]?.edgeInfo,
          score: rightNode.data.score,
        });

        rightNode = rightNode.parent;

        metaPath.nodes.push({
          nodeType: rightNode.data.nodeType,
          nodeId: rightNode.data.nodeId,
        });
      }

      metaPaths.push(metaPath);
    }
  });

  return groupMetaPaths(metaPaths);
};

const groupMetaPaths = (metaPaths: IMetaPath[]): IMetaPathGroup[] => {
  let groups: IMetaPathGroup[] = [];
  let groupDict: string[] = [];
  metaPaths.forEach((metaPath) => {
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

export default rootReducer;
