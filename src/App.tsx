import React from 'react';
import PathMatrix from 'components/CardContainer';
import NodeLink from 'components/TabContainer';
import DrugSider from 'components/Sider';

import { Layout, Modal, Dropdown, Menu, Space, Spin } from 'antd';
import {
  InfoCircleOutlined,
  LinkOutlined,
  DownOutlined,
} from '@ant-design/icons';
import './App.css';
import { StateConsumer } from 'stores';
import { IState, IDispatch } from 'types';
import {
  ACTION_TYPES,
  selectDisease,
  selectDrug,
  toggleMetaPathExpand,
  updateCaseDescription,
} from 'stores/actions';
import {
  requestNodeTypes,
  requestEdgeTypes,
  requestNodeNameDict,
  requestDiseaseOptions,
} from 'stores/DataService';
import { setNodeColor, LOADING_ICON, INIT_DISEASE, INIT_DRUGS } from 'helpers';
import { CASES } from 'helpers';
import { rgb } from 'd3';

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
      })
      .then(() => selectDisease(INIT_DISEASE, this.props.dispatch))
      .then(() => {
        selectDrug(INIT_DRUGS[0], INIT_DISEASE, true, this.props.dispatch);

        selectDrug(INIT_DRUGS[1], INIT_DISEASE, true, this.props.dispatch);

        // selectDrug(INIT_DRUGS[2], INIT_DISEASE, true, this.props.dispatch);

        // selectDrug(INIT_DRUGS[3], INIT_DISEASE, true, this.props.dispatch);
      })
      .then(() => {
        this.props.dispatch({
          type: ACTION_TYPES.Set_Loading_Status,
          payload: { isInitializing: false },
        });
      });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize);
  }

  render() {
    let siderWidth = 380,
      footHeight = 20,
      mainViewWidth = window.innerWidth - siderWidth,
      headerHeight = 64,
      mainViewHeight = window.innerHeight - headerHeight - footHeight,
      NodeLinkHeight = mainViewHeight * 0.55,
      MatrixHeight = mainViewHeight - NodeLinkHeight;

    const { isInitializing, nodeNameDict } = this.props.globalState;

    const selectCase = (caseObj: typeof CASES[0]) => {
      const { disease, drug, open_list } = caseObj;

      this.props.dispatch({
        type: ACTION_TYPES.Set_Loading_Status,
        payload: { isInitializing: true },
      });

      return selectDisease(disease, this.props.dispatch)
        .then(() => {
          this.props.dispatch({
            type: ACTION_TYPES.Set_Loading_Status,
            payload: { isInitializing: false },
          });
          updateCaseDescription(caseObj.description, this.props.dispatch);
          return selectDrug(drug, disease, true, this.props.dispatch);
        })
        .then(() => {
          open_list.map((idx) =>
            toggleMetaPathExpand(
              this.props.globalState.metaPathSummary,
              idx,
              this.props.dispatch
            )
          );
        });
    };

    const menu = isInitializing ? (
      <Menu />
    ) : (
      <Menu>
        {CASES.map((oneCase, idx) => {
          let { disease, drug } = oneCase;
          return (
            <Menu.Item
              key={`case${idx + 1}`}
              onClick={() => selectCase(oneCase)}
            >{`case ${idx + 1}: ${nodeNameDict['disease'][disease]} --- ${
              nodeNameDict['drug'][drug]
            }`}</Menu.Item>
          );
        })}
      </Menu>
    );

    let header = (
      <Header className="header" style={{ height: headerHeight }}>
        <img
          src="favicon.ico"
          style={{ height: headerHeight * 0.8, padding: '2px 10px' }}
          alt="logo"
        />
        <b style={{ fontSize: '30px' }}>TxGNN Explorer</b>
        <span style={{ float: 'right', cursor: 'pointer', fontSize: '20px' }}>
          <Space size={15}>
            <Dropdown overlay={menu} arrow>
              <Space size={2}>
                Case Studies
                <DownOutlined />
              </Space>
            </Dropdown>

            <Space size={4} onClick={this.showModal}>
              About
              <InfoCircleOutlined />
            </Space>
          </Space>
        </span>
      </Header>
    );

    return (
      <>
        <Spin tip="loading..." size="large" spinning={isInitializing}>
          <Layout>
            {header}

            <Layout>
              <DrugSider siderWidth={siderWidth} />
              <Content className="main" style={{ height: mainViewHeight }}>
                <PathMatrix width={mainViewWidth} height={MatrixHeight} />
                <NodeLink width={mainViewWidth} height={NodeLinkHeight} />
                <Footer
                  style={{
                    textAlign: 'center',
                    color: 'gray',
                    height: footHeight,
                    padding: 0,
                  }}
                >
                  Copyright © {new Date().getFullYear()} Harvard.
                  <a href="http://gehlenborglab.org/" target="_blank_">
                    Gehlenborg Lab <LinkOutlined />
                  </a>
                  &
                  <a href="https://zitniklab.hms.harvard.edu/" target="_blank_">
                    Zitnik Lab <LinkOutlined />
                  </a>
                  |
                  <span style={{ color: 'gray' }}>
                    <b onClick={this.showModal} style={{ cursor: 'help' }}>
                      DISCLAIMER:
                    </b>
                    THIS WEBSITE DOES NOT PROVIDE MEDICAL ADVICE
                  </span>
                </Footer>
              </Content>
            </Layout>
          </Layout>
        </Spin>

        <Modal
          title="About TxGNN Explorer"
          className="about-modal"
          visible={this.state.isModalVisible}
          footer={null}
          onCancel={this.hideModal}
          zIndex={1099}
          width={window.innerWidth * 0.7}
        >
          <h3>About</h3>
          <p>
            TxGNN Explorer provides a visual interface for our paper titled{' '}
            <a
              href="https://www.medrxiv.org/content/10.1101/2023.03.19.23287458v1"
              target="_blank_"
            >
              Zero-shot drug repurposing with geometric deep learning and
              clinician centered design
            </a>
            , which propose TxGNN for identifying therapeutic opportunities for
            diseases with limited treatment options and minimal molecular
            understanding.
          </p>
          <p>
            {/* TxGNN is a graph neural network pre-trained on a comprehensive
            knowledge graph of 17,080 clinically-recognized diseases and 7,957
            therapeutic candidates. The model can process various therapeutic
            tasks in a unified formulation. Once trained, we show that TXGNN can
            perform zero-shot inference on new diseases without the need for
            additional parameters or fine-tuning on ground truth labels. */}
            Historically, drug repurposing identifying new therapeutic uses for
            approved drugs has been attributed to serendipity. While recent
            advances have leveraged knowledge graphs and deep learning to
            identify potential therapeutic candidates, their clinical utility
            remains limited because they focus on diseases with available
            existing treatments and rich molecular knowledge. Here, we introduce
            TxGNN, a geometric deep learning approach designed for "zero-shot"
            drug repurposing, enabling therapeutic predictions even for diseases
            with no existing medicines. Trained on a medical knowledge graph,
            TxGNN utilizes a graph neural network and metric-learning module to
            rank therapeutic candidates as potential indications and
            contraindications across 17,080 diseases. When benchmarked against
            eight leading methods, TxGNN significantly improves prediction
            accuracy for indications by 49.2% and contraindications by 35.1%
            under stringent zero-shot evaluation. To facilitate interpretation
            and analysis of the model's predictions, TxGNN's Explainer module
            offers transparent insights into the multi-hop paths that form
            TxGNN's predictive rationale. Clinicians and scientists found
            TxGNN's explanations instrumental in contextualizing and validating
            its predicted therapeutic candidates during our user study. Many of
            TxGNN's novel predictions have shown remarkable alignment with
            off-label prescriptions made by clinicians within a large healthcare
            system, affirming their real-world utility. TxGNN provides drug
            repurposing predictions that are more accurate than existing
            methods, consistent with off-label prescription decisions made by
            clinicians, and can be investigated through multi-hop interpretable
            explanations.
          </p>

          <p>
            The design of TxGNN Explorer follows a user-centered design method.
            Please refer to our IEEE VIS 2022{' '}
            <a
              href="https://ieeexplore.ieee.org/document/9916585"
              target="_blank_"
            >
              paper
            </a>
            (honorable mention) for more details about the design,
            implementation, and evaluation of TxGNN Explorer.
          </p>

          <h3>Team</h3>
          <p>
            <ul>
              <li>
                <a href="https://www.kexinhuang.com/" target="_blank_">
                  Kexin Huang<sup>*</sup>
                </a>
              </li>
              <li>
                <a
                  href="https://scholar.google.com/citations?user=i6T8EOQAAAAJ&hl=en"
                  target="_blank_"
                >
                  Payal Chandak<sup>*</sup>
                </a>
              </li>
              <li>
                <a href="https://qianwen.info/" target="_blank_">
                  Qianwen Wang
                </a>
              </li>
              <li>
                <a> Shreyas Havaldar</a>
              </li>
              <li>
                <a
                  href="https://scholar.google.com/citations?user=zYkgms4AAAAJ&hl=en"
                  target="_blank_"
                >
                  Akhil Vaid
                </a>
              </li>
              <li>
                <a href="https://cs.stanford.edu/~jure/" target="_blank_">
                  Jure Leskovec
                </a>
              </li>
              <li>
                <a href="https://www.nadkarnilab.com/girish" target="_blank_">
                  Girish Nadkarni
                </a>
              </li>
              <li>
                <a
                  href="https://www.hpims.org/labs/ben-glicksberg-lab"
                  target="_blank_"
                >
                  Benjamin S. Glicksberg
                </a>
              </li>
              <li>
                <a href="http://gehlenborglab.org/" target="_blank_">
                  Nils Gehlenborg
                </a>
              </li>
              <li>
                <a
                  href="https://zitniklab.hms.harvard.edu/bio/"
                  target="_blank_"
                >
                  Marinka Zitnik
                </a>
              </li>
            </ul>
          </p>

          <p>
            <h3>Contact:</h3>
            <a href="https://zitniklab.hms.harvard.edu/bio/" target="_blank_">
              Marinka Zitnik (marinka@hms.harvard.edu)
            </a>
            <br />
            This website is developed and maintained by{' '}
            <a href="https://qianwen.info" target="_blank_">
              Qianwen Wang
            </a>
          </p>

          <h3>Medical Advice Disclaimer</h3>
          <p>
            DISCLAIMER: THIS WEBSITE DOES NOT PROVIDE MEDICAL ADVICE
            <br />
            The information, including but not limited to, text, graphics,
            images and other material contained on this website are for
            informational purposes only. No material on this site is intended to
            be a substitute for professional medical advice, diagnosis or
            treatment. Always seek the advice of your physician or other
            qualified health care provider with any questions you may have
            regarding a medical condition or treatment and before undertaking a
            new health care regimen, and never disregard professional medical
            advice or delay in seeking it because of something you have read on
            this website.
          </p>

          <h3>More</h3>
          <a href="https://github.com/mims-harvard/TxGNN" target="_blank_">
            Github Repo: TxGNN <LinkOutlined />
          </a>
          <br />
          <a
            href="https://github.com/hms-dbmi/drug_explorer/tree/TxGNN"
            target="_blank_"
          >
            Github Repo: TxGNN Explorer <LinkOutlined />
          </a>
        </Modal>
      </>
    );
  }
}

export default StateConsumer(App);
