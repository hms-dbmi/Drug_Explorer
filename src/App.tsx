import React from 'react';

import { Layout, Form, Input } from 'antd';
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

import MyForm from 'components/MyForm';

const { Header, Footer } = Layout;

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
    const footHeight = 40,
      mainViewHeight = window.innerHeight - footHeight;

    return (
      <Layout>
        <MyForm height={mainViewHeight} />
        <Footer style={{ height: footHeight, padding: '5px' }}>
          copyright@2021 Harvard
        </Footer>
      </Layout>
    );
  }
}

export default StateConsumer(App);
