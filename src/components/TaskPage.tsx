import React, { CSSProperties } from 'react';
import { StateConsumer } from 'stores';
import { IState } from 'types';
import { Form, Radio, Row, Col } from 'antd';
import LoadingPage from './LoadingPage';
import AttentionTree from './NodeLink/AttentionTree';
import Graph from './NodeLink/Graph';
import PathMatrix from './PathMatrix';

interface Props {
  globalState: IState;
  questionIdx: number;
  width: number;
}

const stateStyle = {
  textAlign: 'right',
  padding: '5px 8px',
  borderRight: 'gray 1px solid',
} as CSSProperties;

const nameStyle = {
  border: 'black solid 1px',
  padding: '0px 3px',
  margin: '3px',
} as CSSProperties;

const TaskPage = (props: Props) => {
  const {
    questions,
    nodeNameDict,
    drugPredictions,
    isPageLoading,
  } = props.globalState;
  if (isPageLoading)
    return <LoadingPage width={props.width} height={window.innerHeight / 2} />;

  const { questionIdx } = props;

  const drugName =
      nodeNameDict['drug'] &&
      nodeNameDict['drug'][questions[questionIdx]['drug']],
    diseaseName =
      nodeNameDict['disease'] &&
      nodeNameDict['disease'][questions[questionIdx]['disease']];

  const predScore = drugPredictions[0].score;

  let explanation = <></>;
  if (questions[questionIdx].condition === 'model') {
    explanation = (
      <div style={{ height: '300px', overflowY: 'scroll' }}>
        <AttentionTree
          width={props.width}
          height={300}
          globalState={props.globalState}
        />
      </div>
    );
  } else if (questions[questionIdx].condition === 'domain') {
    explanation = (
      <PathMatrix
        width={props.width}
        height={300}
        globalState={props.globalState}
      />
    );
  } else if (questions[questionIdx].condition === 'graph') {
    explanation = (
      <Graph width={props.width} height={300} globalState={props.globalState} />
    );
  }

  return (
    <>
      <h3 style={{ margin: '5px' }}>
        {questionIdx + 1}. For the disease
        <span style={nameStyle}>{diseaseName}</span>
        and the drug <span style={nameStyle}>{drugName}</span>,
      </h3>
      <h3 className="indent">Here is the AI prediction:</h3>
      <span className="indent">
        this drug can potentially be used for this disease and my
        confidence_score is {predScore.toFixed(3)}
      </span>

      {explanation}

      <h3 style={{ margin: '5px' }}>
        <b>a)</b> Please select the most possible relation you think
      </h3>
      <Form.Item
        name={`question_${questionIdx}`}
        className="indent"
        rules={[{ required: true, message: 'required' }]}
      >
        <Radio.Group>
          <Radio value="indicatable">Indicatable</Radio>
          <Radio value="not indicatable">Not indicatable</Radio>
        </Radio.Group>
      </Form.Item>

      <h3 style={{ margin: '5px' }}>
        <b>b)</b> Please rate your agreement level for the following statements
      </h3>
      {/* aggreement level */}
      <Row gutter={16}>
        <Col span={8} style={stateStyle}>
          I am confident about my selection above
        </Col>
        <Col span={16}>
          <Form.Item
            name={`confidence_${questionIdx}`}
            rules={[{ required: true, message: 'required' }]}
          >
            <Radio.Group>
              <Radio value="-2">Strongly Disagree</Radio>
              <Radio value="-1">Disagree</Radio>
              <Radio value="0">Neutral</Radio>
              <Radio value="1">Agree</Radio>
              <Radio value="2">Strongly Agree</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8} style={stateStyle}>
          {' '}
          I understand why AI makes this prediction
        </Col>
        <Col span={16}>
          <Form.Item
            name={`understand_${questionIdx}`}
            rules={[{ required: true, message: 'required' }]}
          >
            <Radio.Group>
              <Radio value="-2">Strongly Disagree</Radio>
              <Radio value="-1">Disagree</Radio>
              <Radio value="0">Neutral</Radio>
              <Radio value="1">Agree</Radio>
              <Radio value="2">Strongly Agree</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8} style={stateStyle}>
          The AI explanation helps me assess the drug indication
        </Col>
        <Col span={16}>
          <Form.Item
            name={`helpful_${questionIdx}`}
            rules={[{ required: true, message: 'required' }]}
          >
            <Radio.Group>
              <Radio value="-2">Strongly Disagree</Radio>
              <Radio value="-1">Disagree</Radio>
              <Radio value="0">Neutral</Radio>
              <Radio value="1">Agree</Radio>
              <Radio value="2">Strongly Agree</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8} style={stateStyle}>
          I trust this AI to make predictions for drug repurposing
        </Col>
        <Col span={16}>
          <Form.Item
            name={`trust_${questionIdx}`}
            rules={[{ required: true, message: 'required' }]}
          >
            <Radio.Group>
              <Radio value="-2">Strongly Disagree</Radio>
              <Radio value="-1">Disagree</Radio>
              <Radio value="0">Neutral</Radio>
              <Radio value="1">Agree</Radio>
              <Radio value="2">Strongly Agree</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default StateConsumer(TaskPage);
