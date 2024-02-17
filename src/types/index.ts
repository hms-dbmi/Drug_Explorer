import AttentionTree from 'components/TabContainer/AttentionTree';

export interface INode extends d3.SimulationNodeDatum {
  id: string;
  fx?: number;
  fy?: number;
  isFocused?: boolean;
  pathIdx?: number;
}

export interface ILink {
  source: string;
  target: string;
  isFocused?: boolean;
  pathIdx?: number;
}

export interface IPath {
  edges: {
    edgeInfo: string;
    score: number;
  }[];
  nodes: { nodeId: string; nodeType: string }[];
  hide: boolean;
}

export interface IMetaPath {
  nodeTypes: string[];
  paths: IPath[];
}

export interface IMetaPathSummary {
  nodeTypes: string[];
  count: { [drug_id: string]: number }; // only count for selected drugs whose count > 0
  sum: number;
  hide: boolean;
  expand: boolean;
  idx: number;
}

export interface IAttentionTree {
  nodeId: string;
  nodeType: string;
  score: number;
  edgeInfo: string;
  children: IAttentionTree[];
}

export interface IEdgeTypes {
  [edgeKey: string]: {
    nodes: [string, string];
    edgeInfo: string;
  };
}

export type IAction = {
  type: string;
  payload: any;
};

type TDispatchPayload = Partial<
  IState & {
    selectedDrug: string | undefined;
    metaPathGroup: IMetaPath[];
    nodeAttention: AttentionTree;
  }
>;

export type IDispatch = ({
  type,
}: {
  type: string;
  payload?: TDispatchPayload;
}) => void;

export type DrugPrediction = {
  score: number;
  id: string;
  known: boolean;
  selected: boolean;
};

export interface IState {
  edgeThreshold: number;
  nodeTypes: string[];
  edgeTypes: IEdgeTypes;
  diseaseOptions: [string, boolean][]; // [disease_id, is_treatable]
  drugPredictions: DrugPrediction[];
  selectedDisease: string | undefined;
  nodeNameDict: { [type: string]: { [id: string]: string } };
  isInitializing: boolean;
  isAttentionLoading: boolean;
  isDrugLoading: boolean;
  isDiseaseLoading: boolean;
  attention: { [nodeKey: string]: IAttentionTree }; // node key = ${node_type}:${node_id}
  metaPathGroups: { [drugID: string]: IMetaPath[] };
  metaPathSummary: IMetaPathSummary[]; // each element is a group of paths with the same node types
  selectedPathNodes: IPath['nodes'];
  caseDescription: JSX.Element | undefined;
}
