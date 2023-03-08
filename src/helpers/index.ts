import { IAttentionTree } from 'types';
export { cropText, getTextWidth } from './text';
export * from './icon';

export {
  setNodeColor,
  getNodeColor,
  HIGHLIGHT_COLOR,
  SELECTED_COLOR,
} from './color';

export const pruneEdge = (
  node: IAttentionTree,
  threshold: number
): IAttentionTree => {
  if (node.children.length > 0) {
    node = {
      ...node,
      children: node.children
        .filter((d) => d.score >= threshold)
        .map((node) => pruneEdge(node, threshold)),
    };
  }
  return node;
};

export const sigmoid = (t: number) => {
  return 1 / (1 + Math.pow(Math.E, -t));
};

export const removeDiseaseList = [
  'Mendelian disease',
  'Disease of cell nucleous',
  'Hip region disease',
  'Acute disease',
  'Vector borne disease',
  'cancer',
  'Sex-linked disease',
  'Movement disorder',
];

export const sentenceCapitalizer = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
