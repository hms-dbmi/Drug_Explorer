const COLORS = [
  '#4e79a7',
  '#edc949',
  '#e15759',
  '#f28e2c',
  '#76b7b2',
  '#59a14f',
  '#af7aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ab',
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
const SELECTED_COLOR = 'dark';

export { setNodeColor, getNodeColor, HIGHLIGHT_COLOR, SELECTED_COLOR };
