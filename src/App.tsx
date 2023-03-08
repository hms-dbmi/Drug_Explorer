import React from 'react';
import PathMatrix from 'components/CardContainer';
import NodeLink from 'components/TabContainer';
import DrugSider from 'components/Sider';

import { Layout, Modal } from 'antd';
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
  isModalVisible: boolean;
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      isModalVisible: false,
    };

    this.updateSize = this.updateSize.bind(this);
  }

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  hideModal = () => {
    this.setState({ isModalVisible: false });
  };

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
        <b style={{ fontSize: '30px' }}>TxGNN Explorer</b>
        <span style={{ float: 'right' }} onClick={this.showModal}>
          <InfoCircleOutlined
            style={{ height: headerHeight, fontSize: '20px' }}
          />
          <span
            style={{
              paddingLeft: '5px',
              fontSize: '18px',
              height: headerHeight,
            }}
          >
            About
          </span>{' '}
        </span>
      </Header>
    );

    return (
      <>
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

        <Modal
          title="About TxGNN Explorer"
          visible={this.state.isModalVisible}
          footer={null}
          onCancel={this.hideModal}
          zIndex={1099}
        >
          <h3>About</h3>
          <p>
            TxGNN Explorer provides a visual interface to interact with the
            predicitons and explanations of TXGNN, a model for identifying
            therapeutic opportunities for diseases with limited treatment
            options and minimal molecular understanding.
          </p>
          <p>
            TxGNN is a graph neural network pre-trained on a comprehensive
            knowledge graph of 17,080 clinically-recognized diseases and 7,957
            therapeutic candidates. The model can process various therapeutic
            tasks in a unified formulation. Once trained, we show that TXGNN can
            perform zero-shot inference on new diseases without the need for
            additional parameters or fine-tuning on ground truth labels.
          </p>

          <p>
            The design of TxGNN Explorer follows a user-centered design method.
            Please refer to our IEEE VIS 2022{' '}
            <a
              href="https://ieeexplore.ieee.org/document/9916585"
              target="_blank_"
            >
              paper
            </a>{' '}
            (honorable mention) for more details about the design,
            implementation, and evaluation of TxGNN Explorer.
          </p>
          <h3>Team</h3>
          <p>
            Kexin Huang<sup>*</sup>, Payal Chandak<sup>*</sup>, Qianwen Wang,
            Shreyas Havaldar, Akhil Vaid, Jure Leskovec, Girish Nadkarni,
            Benjamin S. Glicksberg, Nils Gehlenborg, and Marinka Zitnik
            <h4>Contact: marinka@hms.harvard.edu</h4>
          </p>

          <h3>More</h3>
          <a href="https://github.com/mims-harvard/TxGNN" target="_blank">
            Github Repo: TxGNN <LinkOutlined />
          </a>
          <br />
          <a
            href="https://github.com/hms-dbmi/drug_explorer/tree/TxGNN"
            target="_blank"
          >
            Github Repo: TxGNN Explorer <LinkOutlined />
          </a>
        </Modal>
      </>
    );
  }
}

export default StateConsumer(App);
