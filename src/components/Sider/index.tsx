import React from 'react';
import { StateConsumer } from 'stores';
import { IDispatch, IState } from 'types';
import { ACTION_TYPES, selectDisease, selectDrug } from 'stores/actions';

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
    this.onChangeDisease = this.onChangeDisease.bind(this);
    this.onChangeDrug = this.onChangeDrug.bind(this);
  }
  onChangeDrug(selectedDrugs: string[]) {
    const isAdd =
      selectedDrugs.length > this.props.globalState.drugPredictions.length;

    const currentDrug = selectedDrugs[selectedDrugs.length - 1];
    selectDrug(
      currentDrug,
      this.props.globalState.selectedDisease,
      isAdd,
      this.props.dispatch
    );
  }
  changeEdgeTHR(value: number | undefined | string) {
    if (typeof value == 'number') {
      this.props.dispatch({
        type: ACTION_TYPES.Change_Edge_THR,
        payload: { edgeThreshold: value },
      });
    }
  }

  onChangeDisease(selectedDisease: string) {
    selectDisease(selectedDisease, this.props.dispatch);
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
    const defaultDiseaseText = 'Select a disease';
    const defaultDrugText = 'Select a drug from the prediction';
    const selectedDrugIds = drugPredictions
      .filter((d) => d.selected)
      .map((d) => d.id);

    let sider = (
      <Sider
        width={siderWidth}
        theme="light"
        style={{ padding: `${this.padding}px` }}
      >
        Disease:
        <Select
          defaultValue={defaultDiseaseText}
          style={{ width: siderWidth - 2 * this.padding }}
          onChange={this.onChangeDisease}
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
          mode="multiple"
          style={{ width: siderWidth - 2 * this.padding }}
          open
          showSearch
          optionFilterProp="label"
          listHeight={this.listHeight}
          onChange={this.onChangeDrug}
          placeholder={defaultDrugText}
          value={selectedDrugIds}
        >
          {selectedDisease !== undefined ? (
            drugPredictions.length > 0 ? (
              drugPredictions.map((d, idx) => {
                const { id: drug_id, score } = d;
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
              max={1.5}
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
