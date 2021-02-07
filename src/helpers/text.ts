const cropText = (
  text: string,
  fontSize: number,
  maxWidth: number,
  fontWeight: number = 800
): string => {
  let returnText = text;
  const context = document
    .createElement('canvas')
    .getContext('2d') as CanvasRenderingContext2D;
  context.font = `${fontWeight} ${fontSize}px Arial`;
  const width = context.measureText(text).width;
  if (width > maxWidth) {
    for (let i = 1; i < text.length; i += 1) {
      const prevText = text.substr(0, i - 1).concat('...');
      const currText = text.substr(0, i).concat('...');
      const prevWidth = context.measureText(prevText).width;
      const currWidth = context.measureText(currText).width;
      if (currWidth > maxWidth && prevWidth < maxWidth) {
        returnText = prevText;
        break;
      }
    }
  }
  return returnText;
};

const getTextWidth = (text: string, fontSize: number): number => {
  const context = document
    .createElement('canvas')
    .getContext('2d') as CanvasRenderingContext2D;
  context.font = `${fontSize}px Arial`;
  const width = context.measureText(text).width;
  return width;
};

export { cropText, getTextWidth };
