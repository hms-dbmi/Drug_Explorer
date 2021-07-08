import React from 'react';
import { Tabs } from 'antd';
import { StateConsumer } from 'stores';
import { IState, IDispatch } from 'types';

import AttentionTree from './AttentionTree';
import Scatter from './Scatter';
import Graph from './Graph';

import './index.css';

const { TabPane } = Tabs;

interface Props {
  width: number;
  height: number;
  globalState: IState;
  dispatch: IDispatch;
}

interface State {
  activeTab: string;
}

class NodeLink extends React.Component<Props, State> {
  titleHeight = 36;
  margin = 10;
  padding = 10;
  constructor(props: Props) {
    super(props);
    this.state = {
      activeTab: 'embedding',
    };
  }
  changeActiveTab(key: string) {
    this.setState({ activeTab: key });
  }

  render() {
    const { width, height } = this.props;
    const cardWidth = width - 2 * this.margin - 2 * this.padding,
      cardHeight =
        height - 2 * this.padding - this.titleHeight - 2 * this.margin;

    const props = { ...this.props, height: cardHeight, width: cardWidth };

    return (
      <Tabs
        size="small"
        activeKey={this.state.activeTab}
        style={{
          width: width - 2 * this.margin,
          height: height - 2 * this.margin,
          margin: this.margin,
          backgroundColor: 'white',
        }}
        tabBarStyle={{
          height: this.titleHeight,
          padding: '0px 10px',
          margin: '0px',
        }}
        onChange={this.changeActiveTab.bind(this)}
      >
        <TabPane
          style={{ padding: this.padding }}
          key="embedding"
          tab="Node Embedding"
        >
          <div
            className="nodelink"
            style={{
              width: cardWidth,
              height: cardHeight,
              overflowY: 'scroll',
            }}
          >
            <Scatter {...props} />
          </div>
        </TabPane>

        <TabPane
          style={{ padding: this.padding }}
          key="attention"
          tab="Node Attention"
        >
          <div
            className="nodelink"
            style={{
              width: cardWidth,
              height: cardHeight,
              overflowY: 'scroll',
            }}
          >
            <AttentionTree {...props} />
          </div>
        </TabPane>

        <TabPane style={{ padding: this.padding }} key="graph" tab="Sub-Graph">
          <div
            className="nodelink"
            style={{
              width: cardWidth,
              height: cardHeight,
              overflowY: 'scroll',
            }}
          >
            <Graph {...props} />
          </div>
        </TabPane>
      </Tabs>
    );
  }
}

export default StateConsumer(NodeLink);
