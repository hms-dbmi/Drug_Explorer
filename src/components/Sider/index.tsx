import React from 'react';
import { StateConsumer } from 'stores';
import { IDispatch, IState } from 'types';
import { ACTION_TYPES, selectDisease, selectDrug } from 'stores/actions';

import './Sider.css';

import {
  Col,
  InputNumber,
  Layout,
  Row,
  Select,
  Skeleton,
  Slider,
  Tooltip,
} from 'antd';
import { QuestionCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import {
  getNodeColor,
  sigmoid,
  wheterRemoveDisease,
  sentenceCapitalizer,
  INIT_DISEASE,
  INIT_DRUGS,
} from 'helpers';

const { Sider } = Layout;
const { Option } = Select;

interface Props {
  siderWidth: number;
  globalState: IState;
  dispatch: IDispatch;
}

class DrugSider extends React.Component<Props> {
  padding = 10;
  listHeight = 450; // height of the open drug list
  constructor(props: Props) {
    super(props);
    this.changeEdgeTHR = this.changeEdgeTHR.bind(this);
    this.changeRevEdgeTHR = this.changeRevEdgeTHR.bind(this);
    this.onChangeDisease = this.onChangeDisease.bind(this);
    this.onChangeDrug = this.onChangeDrug.bind(this);
  }
  onChangeDrug(selectedDrugs: string[]) {
    const prevSelectedDrugs = this.props.globalState.drugPredictions
      .filter((d) => d.selected)
      .map((d) => d.id);
    const isAdd = selectedDrugs.length > prevSelectedDrugs.length;

    const currentDrug = isAdd
      ? selectedDrugs[selectedDrugs.length - 1]
      : prevSelectedDrugs.filter((d) => !selectedDrugs.includes(d))[0];
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

  changeRevEdgeTHR(value: number | undefined | string) {
    if (typeof value == 'number') {
      this.props.dispatch({
        type: ACTION_TYPES.Change_Edge_THR,
        payload: { edgeThreshold: Math.round(10 - 10 * value) / 10 },
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
      isInitializing,
    } = this.props.globalState;
    const defaultDiseaseText = 'Search to Select a disease';
    const defaultDrugText = 'Select a drug from the prediction';
    const selectedDrugIds = drugPredictions
      .filter((d) => d.selected)
      .map((d) => d.id);

    const untreatable_disease_icon = (
      <Tooltip
        // title="The knowledge graph contains no drug for treating this disease"
        title="Diseases with no known drug indications in the dataset"
      >
        <QuestionCircleOutlined style={{ color: '#eb2f96' }} />
      </Tooltip>
    );

    const known_drug_icon = (
      <Tooltip
        // title="the knowledge graph contains this drug indication"
        title="US FDA-approved drug indication"
      >
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
      </Tooltip>
    );

    let sider = (
      <Sider
        width={siderWidth}
        theme="light"
        style={{ padding: `${this.padding}px` }}
      >
        Disease:
        <Select
          defaultValue={INIT_DISEASE}
          value={selectedDisease}
          style={{ width: siderWidth - 2 * this.padding }}
          onChange={this.onChangeDisease}
          showSearch
          optionFilterProp="label"
        >
          {diseaseOptions.length > 0 ? (
            diseaseOptions
              .filter(
                (d) => !wheterRemoveDisease(nodeNameDict['disease'][d[0]]) // remove some diseases that are too general
              )
              .map((d) => {
                const [id, treatable] = d;
                const name = nodeNameDict['disease'][id];
                const cropName =
                  name.length * 10 > siderWidth * 0.8
                    ? name.slice(0, 40) + '...'
                    : name;
                return (
                  <Option value={id} label={name} key={`diseaseID_${d}`}>
                    <span title={name}> {sentenceCapitalizer(cropName)} </span>
                    {!treatable && untreatable_disease_icon}
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
        {drugPredictions.length === 0 || isInitializing ? (
          // <span>Data is Loading.. </span>
          <Skeleton />
        ) : (
          <Select
            mode="multiple"
            style={{ width: siderWidth - 2 * this.padding }}
            open
            showSearch
            optionFilterProp="label"
            listHeight={this.listHeight}
            onChange={this.onChangeDrug}
            defaultValue={INIT_DRUGS}
            value={selectedDrugIds}
            // menuItemSelectedIcon={<EyeOutlined />}
            menuItemSelectedIcon={<></>}
          >
            {drugPredictions.map((d, idx) => {
              const { id: drug_id, score, known } = d;

              const name = nodeNameDict['drug'][drug_id];
              if (name === undefined) {
                return <></>;
              }
              const cropName =
                name.length * 10 > siderWidth * 0.5
                  ? name.slice(0, 20) + '...'
                  : name;
              return (
                <Option value={drug_id} key={`disease_${idx}`} label={name}>
                  <div>
                    <span>
                      [{idx + 1}] <span title={name}>{cropName}</span>{' '}
                      {known && known_drug_icon}
                    </span>
                    <span style={{ float: 'right' }}>
                      score: {sigmoid(score).toFixed(3)}
                      {/* rank: {idx + 1} */}
                    </span>
                  </div>
                </Option>
              );
            })}
          </Select>
        )}
        <div className="dummy" style={{ height: this.listHeight + 20 }} />
        Minimum self-explaining edge score:
        <Row gutter={20}>
          <Col span={5}>
            <InputNumber
              value={edgeThreshold}
              onChange={this.changeEdgeTHR}
              style={{ width: '100%' }}
              step={0.1}
              min={0}
              max={1}
            />
          </Col>
          <Col span={16}>
            <Slider
              step={0.1}
              value={1 - edgeThreshold}
              min={0}
              max={1}
              onChange={this.changeRevEdgeTHR}
              marks={{ 0: '1.0', 1: '0.0' }}
              reverse={true}
              tipFormatter={(value?: number) => {
                return value && (1 - value).toFixed(1);
              }}
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
