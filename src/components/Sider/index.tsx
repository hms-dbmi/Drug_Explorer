import React from 'react';
import { StateConsumer } from 'stores';
import { IDispatch, IState } from 'types';
import { ACTION_TYPES } from 'stores/actions';
import { requestAttention, requestDrugPredictions } from 'stores/DataService';

import './Sider.css';

import { Col, InputNumber, Layout, Row, Select, Slider } from 'antd';
import { getNodeColor } from 'helpers/color';
const { Sider } = Layout;
const { Option } = Select;

interface Props {
  siderWidth: number;
  globalState: IState;
  dispatch: IDispatch;
}

class DrugSider extends React.Component<Props> {
  padding = 10;
  listHeight = 150; // height of the open drug list
  constructor(props: Props) {
    super(props);
    this.changeEdgeTHR = this.changeEdgeTHR.bind(this);
    this.changeDisease = this.changeDisease.bind(this);
    this.changeDrug = this.changeDrug.bind(this);
  }
  queryAttention(
    selectedDrug: string | undefined,
    selectedDisease: string | undefined
  ) {
    if (!selectedDrug) {
      selectedDrug = this.props.globalState.selectedDrug;
    }
    if (!selectedDisease) {
      selectedDisease = this.props.globalState.selectedDisease;
    }

    if (selectedDrug !== undefined && selectedDisease !== undefined) {
      this.props.dispatch({
        type: ACTION_TYPES.Set_Attention_Loading_Status,
        payload: { isAttentionLoading: true },
      });

      requestAttention(selectedDisease, selectedDrug)
        .then((attention) => {
          this.props.dispatch({
            type: ACTION_TYPES.Load_Attention,
            payload: { attention },
          });
        })
        .then(() => {
          this.props.dispatch({
            type: ACTION_TYPES.Set_Attention_Loading_Status,
            payload: { isAttentionLoading: false },
          });
        });
    }
  }
  changeDrug(selectedDrug: string) {
    this.props.dispatch({
      type: ACTION_TYPES.Change_Drug,
      payload: { selectedDrug },
    });
    this.queryAttention(selectedDrug, undefined);
  }
  changeEdgeTHR(value: number | undefined | string) {
    if (typeof value == 'number') {
      this.props.dispatch({
        type: ACTION_TYPES.Change_Edge_THR,
        payload: { edgeThreshold: value },
      });
    }
  }

  changeDisease(selectedDisease: string) {
    this.props.dispatch({
      type: ACTION_TYPES.Change_Disease,
      payload: { selectedDisease },
    });

    requestDrugPredictions(selectedDisease).then((res) => {
      const {
        predictions: drugPredictions,
        metapathSummary: metaPathSummary,
      } = res;
      this.props.dispatch({
        type: ACTION_TYPES.Load_Edge_Types,
        payload: { drugPredictions, metaPathSummary },
      });
    });
  }
  render() {
    let { siderWidth } = this.props;
    let {
      edgeThreshold,
      nodeTypes,
      diseaseOptions,
      drugPredictions,
      nodeNameDict,
      selectedDisease,
    } = this.props.globalState;

    let sider = (
      <Sider
        width={siderWidth}
        theme="light"
        style={{ padding: `${this.padding}px` }}
      >
        Disease:
        <Select
          defaultValue="select a disease"
          style={{ width: siderWidth - 2 * this.padding }}
          onChange={this.changeDisease}
          showSearch
          optionFilterProp="label"
        >
          {diseaseOptions.length > 0 ? (
            diseaseOptions.map((d) => {
              const name = nodeNameDict['disease'][d];
              return (
                <Option value={d} label={name} key={`diseaseID_${d}`}>
                  {name}
                </Option>
              );
            })
          ) : (
            <Option value="loading" label="loading" key="loading">
              data is loading..
            </Option>
          )}
        </Select>
        <br />
        Drug:
        <Select
          defaultValue="select a drug from the predictions"
          style={{ width: siderWidth - 2 * this.padding }}
          open
          showSearch
          optionFilterProp="label"
          listHeight={this.listHeight}
          onChange={this.changeDrug}
        >
          {selectedDisease !== undefined ? (
            drugPredictions.length > 0 ? (
              drugPredictions.map((d, idx) => {
                const { id: drug_id, score } = d;
                console.info(d);
                const name = nodeNameDict['drug'][drug_id];
                return (
                  <Option value={drug_id} key={`disease_${idx}`} label={name}>
                    <div>
                      <span>{name}</span>
                      <span style={{ float: 'right' }}>
                        score: {score.toFixed(3)}
                      </span>
                    </div>
                  </Option>
                );
              })
            ) : (
              <Option value="loading" label="loading" key="loading">
                data is loading..
              </Option>
            )
          ) : (
            <Option value="noDisease" label="noDisease" key="noDisease">
              please select a disease first
            </Option>
          )}
        </Select>
        <div className="dummy" style={{ height: this.listHeight + 20 }} />
        Edge Threshold:
        <Row>
          <Col span={16}>
            <Slider
              step={0.1}
              value={edgeThreshold}
              min={0}
              max={1}
              onChange={this.changeEdgeTHR}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              value={edgeThreshold}
              onChange={this.changeEdgeTHR}
              step={0.1}
            />
          </Col>
        </Row>
        <div className="nodeTypes">
          Node Types:
          <br />
          {nodeTypes.map((nodeType) => {
            return (
              <div key={nodeType} style={{ marginLeft: '5px' }}>
                {/* <input type="checkbox" style={{ margin: "2px" }} /> */}
                <span
                  style={{
                    background: getNodeColor(nodeType),
                    color: 'white',
                    padding: '2px',
                  }}
                >
                  {nodeType}
                </span>
              </div>
            );
          })}
        </div>
        <br />
        {/* <Button
          icon={<SearchOutlined />}
          type="primary"
          shape="round"
          onClick={() => this.startAnalysis()}
        >
          Show Attention Tree
        </Button> */}
        <br />
      </Sider>
    );

    return sider;
  }
}

export default StateConsumer(DrugSider);
