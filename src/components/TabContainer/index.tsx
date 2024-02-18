import React from 'react';
import { Tabs, Spin } from 'antd';
import { StateConsumer } from 'stores';
import { IState, IDispatch } from 'types';

import AttentionTree from './AttentionTree';
import Graph from './Graph';

import './index.css';
import PathMatrix from 'components/TabContainer/PathMatrix';

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
      activeTab: 'metapath',
    };
  }
  changeActiveTab(key: string) {
    this.setState({ activeTab: key });
  }

  render() {
    const { width, height, globalState } = this.props;
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
          height: height - this.margin,
          margin: this.margin,
          marginBottom: 0,
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
          key="metapath"
          tab="Meta-Path"
        >
          <Spin
            tip="loading"
            size="large"
            spinning={
              globalState.isAttentionLoading && !globalState.isInitializing
            }
          >
            <div
              className="nodelink"
              style={{
                width: cardWidth,
                height: cardHeight,
                overflowY: 'scroll',
              }}
            >
              <PathMatrix {...props} />
            </div>
          </Spin>
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
