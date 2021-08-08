import React from 'react';
import { LOADING_ICON } from 'helpers';
interface Props {
  width: number;
  height: number;
}

const LoadingPage = (props: Props) => {
  const { width, height } = props;
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${width / 2 - 35}, ${height / 2 - 50})`}>
        {LOADING_ICON}
      </g>
    </svg>
  );
};

export default LoadingPage;
