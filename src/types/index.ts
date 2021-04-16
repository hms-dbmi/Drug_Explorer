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
  nodes: string[];
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

export type DrugOption = {
  score: number;
  drug_id: string;
};

export interface IState {
  edgeThreshold: number;
  nodeTypes: string[];
  edgeTypes: IEdgeTypes;
  diseaseOptions: string[];
  drugOptions: DrugOption[];
  metaPaths: IMetaPath[];
  selectedDrug: string | undefined;
  selectedDisease: string | undefined;
  nodeNameDict: { [type: string]: { [id: string]: string } };
  isAttentionLoading: boolean;
  attention: { [nodeKey: string]: IAttentionTree };
}
