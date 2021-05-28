import React from 'react';
import { Card, Tooltip } from 'antd';
import { StateConsumer } from 'stores';
import { IState } from 'types';

import AttentionTree from './AttentionTree';
import Scatter from './Scatter';

import './index.css';
interface Props {
  width: number;
  height: number;
  globalState: IState;
}

class NodeLink extends React.Component<Props, {}> {
  titleHeight = 36;
  margin = 10;
  padding = 10;

  render() {
    const { width, height, globalState } = this.props;
    const cardWidth = width - 2 * this.margin - 2 * this.padding,
      cardHeight =
        height - 2 * this.padding - this.titleHeight - 2 * this.margin;

    const props = { ...this.props, height: cardHeight, width: cardWidth };

    const content = globalState.selectedDrug ? (
      <AttentionTree {...props} />
    ) : (
      <Scatter {...props} />
    );
    return (
      <Card
        size="small"
        title="Node Attention"
        style={{
          width: width - 2 * this.margin,
          height: height - 2 * this.margin,
          margin: this.margin,
        }}
        bodyStyle={{ padding: this.padding }}
        headStyle={{ height: this.titleHeight }}
      >
        <div
          className="nodelink"
          style={{ width: cardWidth, height: cardHeight, overflowY: 'scroll' }}
        >
          {content}
        </div>
      </Card>
    );
  }
}

export default StateConsumer(NodeLink);
