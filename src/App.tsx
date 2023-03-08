import React from 'react';
import PathMatrix from 'components/CardContainer';
import NodeLink from 'components/TabContainer';
import DrugSider from 'components/Sider';

import { Layout } from 'antd';
import { InfoCircleOutlined, LinkOutlined } from '@ant-design/icons';
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
      footHeight = 20,
      mainViewWidth = window.innerWidth - siderWidth,
      headerHeight = 64,
      mainViewHeight = window.innerHeight - headerHeight - footHeight,
      NodeLinkHeight = mainViewHeight * 0.55,
      MatrixHeight = mainViewHeight - NodeLinkHeight;

    let header = (
      <Header className="header" style={{ height: headerHeight }}>
        <img
          src="favicon.ico"
          style={{ height: headerHeight * 0.8, padding: '2px 10px' }}
          alt="logo"
        />
        TxGNN Explorer
        <span style={{ float: 'right' }}>
          <InfoCircleOutlined style={{ height: headerHeight }} />
          <span
            style={{
              fontSize: '20px',
              height: headerHeight,
              marginLeft: '4px',
            }}
          >
            About
          </span>{' '}
        </span>
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
        <Footer
          style={{
            textAlign: 'center',
            color: 'gray',
            height: footHeight,
            padding: 0,
          }}
        >
          Copyright © {new Date().getFullYear()} Harvard.{' '}
          <a href="http://gehlenborglab.org/" target="_blank_">
            Gehlenborg Lab <LinkOutlined />
          </a>{' '}
          &{' '}
          <a href="https://zitniklab.hms.harvard.edu/" target="_blank_">
            Zitnik Lab <LinkOutlined />
          </a>
        </Footer>
      </Layout>
    );
  }
}

export default StateConsumer(App);
