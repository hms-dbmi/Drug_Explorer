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

export interface IMetaPath {
  edges: {
    edgeInfo: string;
    score: number;
  }[];
  nodes: { nodeId: string; nodeType: string }[];
}

export interface IMetaPathGroup {
  nodeTypes: string[];
  metaPaths: IMetaPath[];
}

export interface IMetaPathSummary {
  nodeTypes: string[];
  count: number[];
  sum: number;
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

export type IDispatch = ({
  type,
}: {
  type: string;
  payload?: Partial<IState>;
}) => void;

export type DrugPrediction = {
  score: number;
  id: string;
};

export interface IState {
  edgeThreshold: number;
  nodeTypes: string[];
  edgeTypes: IEdgeTypes;
  diseaseOptions: string[];
  drugPredictions: DrugPrediction[];
  metaPathGroups: IMetaPathGroup[];
  selectedDrug: string | undefined;
  selectedDisease: string | undefined;
  nodeNameDict: { [type: string]: { [id: string]: string } };
  isAttentionLoading: boolean;
  attention: { [nodeKey: string]: IAttentionTree };
  metaPathSummary: IMetaPathSummary[];
  selectedPathNodes: IMetaPath['nodes'];
}
