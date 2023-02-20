import React from 'react';
import PathMatrix from 'components/CardContainer';
import NodeLink from 'components/TabContainer';
import DrugSider from 'components/Sider';

import { Layout } from 'antd';
import './App.css';
import { StateConsumer } from 'stores';
import { IState, IDispatch } from 'types';
import { ACTION_TYPES } from 'stores/actions';
import {
  requestNodeTypes,
  requestEdgeTypes,
  requestNodeNameDict,
  requestDiseaseOptions,
} from 'stores/DataService';
import { setNodeColor } from 'helpers/color';

const { Header, Footer, Content } = Layout;

interface Props {
  globalState: IState;
  dispatch: IDispatch;
}
interface State {
  width: number;
  height: number;
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.updateSize = this.updateSize.bind(this);
  }

  updateSize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateSize);

    requestNodeTypes()
      .then((nodeTypes) => {
        setNodeColor(nodeTypes);
        this.props.dispatch({
          type: ACTION_TYPES.Load_Node_Types,
          payload: { nodeTypes },
        });
      })
      .then(() => requestEdgeTypes())
      .then((edgeTypes) => {
        this.props.dispatch({
          type: ACTION_TYPES.Load_Edge_Types,
          payload: { edgeTypes },
        });
      })
      .then(() => requestNodeNameDict())
      .then((nodeNameDict) => {
        this.props.dispatch({
          type: ACTION_TYPES.Load_Node_Name_Dict,
          payload: { nodeNameDict },
        });
      })
      .then(() => requestDiseaseOptions())
      .then((diseaseOptions) => {
        this.props.dispatch({
          type: ACTION_TYPES.Load_Disease_Options,
          payload: { diseaseOptions },
        });
      });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize);
  }

  render() {
    let siderWidth = 300,
      mainViewWidth = window.innerWidth - siderWidth,
      headerHeight = 64,
      mainViewHeight = window.innerHeight - headerHeight,
      NodeLinkHeight = mainViewHeight * 0.55,
      MatrixHeight = mainViewHeight - NodeLinkHeight;

    let header = (
      <Header className="header" style={{ height: headerHeight }}>
        TxGNNExplorer
      </Header>
    );

    return (
      <Layout>
        {header}

        <Layout>
          <DrugSider siderWidth={siderWidth} />
          <Content className="main" style={{ height: mainViewHeight }}>
            <PathMatrix width={mainViewWidth} height={MatrixHeight} />
            <NodeLink width={mainViewWidth} height={NodeLinkHeight} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default StateConsumer(App);
