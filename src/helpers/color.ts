const COLORS = [
  '#4e79a7', // "anatomy",
  '#edc949', // "biological_process",
  '#e15759', // "cellular_component",
  '#f28e2c', // "disease",
  '#76b7b2', // "drug",
  '#59a14f', // "effect/phenotype",
  '#af7aa1', // "exposure",
  '#ff9da7', // "gene/protein",
  '#9c755f', // "molecular_function",
  '#bab0ab', // "pathway"
];
let colorDict: { [node: string]: string } = {};

const setNodeColor = (nodeTypes: string[]) => {
  colorDict = {};
  nodeTypes.forEach((nodeType, idx) => {
    if (idx > COLORS.length - 1) {
      idx = idx % (COLORS.length - 1);
    }
    colorDict[nodeType] = COLORS[idx];
  });
};

const getNodeColor = (nodeType: string) => {
  if (colorDict[nodeType] === undefined) {
    colorDict[nodeType] = COLORS[Object.keys(colorDict).length];
  }

  return colorDict[nodeType];
};

const HIGHLIGHT_COLOR = '#1890ff';
const SELECTED_COLOR = 'black';

export { setNodeColor, getNodeColor, HIGHLIGHT_COLOR, SELECTED_COLOR };
