import { Card } from 'antd';
import Scatter from 'components/CardContainer/Scatter';

import React from 'react';

import './index.css';

interface Props {
  width: number;
  height: number;
}

class Container extends React.Component<Props, {}> {
  TITLE_HEIGHT = 36;
  MARGIN = 10;
  PADDING = 10;

  render() {
    const { width, height } = this.props;
    const svgOuterHeight = height - 2 * this.PADDING - this.TITLE_HEIGHT;
    return (
      <Card
        size="small"
        title="Drug Embeddings"
        style={{
          width: width - 2 * this.MARGIN,
          height: height,
          margin: `0px ${this.MARGIN}px`,
        }}
        bodyStyle={{
          padding: this.PADDING,
          height: height - this.TITLE_HEIGHT,
          overflowY: 'auto',
        }}
        headStyle={{ height: this.TITLE_HEIGHT }}
      >
        <Scatter
          width={width - 2 * this.PADDING - 2 * this.MARGIN}
          height={svgOuterHeight}
        />
      </Card>
    );
  }
}

export default Container;
