import { IAttentionTree } from 'types';
export { cropText, getTextWidth } from './text';
export * from './icon';
export { CASES } from './cases';

export {
  setNodeColor,
  getNodeColor,
  HIGHLIGHT_COLOR,
  SELECTED_COLOR,
} from './color';

export const pruneEdge = (
  node: IAttentionTree,
  threshold: number,
  childeNum?: number
): IAttentionTree => {
  if (node.children.length > 0) {
    node = {
      ...node,
      children: node.children
        .filter((d) => d.score >= threshold)
        .map((node) => pruneEdge(node, threshold, childeNum))
        .slice(0, childeNum), // only keep top 7 children
    };
  }
  return node;
};

export const flatTree = (node: IAttentionTree): string[] => {
  let res = [node.nodeId];
  if (node.children.length > 0) {
    res = res.concat(...node.children.map((d) => flatTree(d)));
  }
  return res;
};

export const sigmoid = (t: number) => {
  return 1 / (1 + Math.pow(Math.E, -t));
};

export const removeDiseaseList = [
  'mendelian disease',
  'disease of cell nucleous',
  'hip region disease',
  'acute disease',
  'vector borne disease',
  'cancer',
  'sex-linked disease',
  'movement disorder',
];

export const wheterRemoveDisease = (disease: string): boolean => {
  return removeDiseaseList.includes(disease.toLowerCase());
};

export const sentenceCapitalizer = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const INIT_DISEASE =
  '5090_13498_8414_10897_33312_10943_11552_14092_12054_11960_11280_11294_11295_11298_11307_11498_12879_13089_13506';
export const INIT_DRUGS = ['DB08815', 'DB01239', 'DB00933', 'DB00363'];
