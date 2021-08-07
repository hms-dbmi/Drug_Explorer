import React from 'react';
import { StateConsumer } from 'stores';
import { IDispatch, IState } from 'types';
import { Form, Radio, Row, Col } from 'antd';

interface Props {
  globalState: IState;
  dispatch: IDispatch;
  questionIdx: number;
}

const TaskPage = (props: Props) => {
  const { questions, nodeNameDict } = props.globalState;
  const { questionIdx } = props;
  const drugName =
      nodeNameDict['drug'] &&
      nodeNameDict['drug'][questions[questionIdx]['drug']],
    diseaseName =
      nodeNameDict['disease'] &&
      nodeNameDict['disease'][questions[questionIdx]['disease']];
  return (
    <>
      <h3 style={{ margin: '5px' }}>
        For the <b>disease: {diseaseName}</b> and the <b>drug: {drugName}</b>,
      </h3>
      <h3 style={{ margin: '5px' }}>Here is the AI prediction</h3>
      <h3 style={{ margin: '5px' }}>
        please select the most possible relation you think
      </h3>

      <Form.Item name={`question_${questionIdx}`}>
        <Radio.Group>
          <Radio value="indicatable">Indicatable</Radio>
          <Radio value="note indicatable">Not indicatable</Radio>
        </Radio.Group>
      </Form.Item>

      <h4 style={{ margin: '5px' }}>
        Please rate your confidence level for your selection above
      </h4>
      {/* aggreement level */}
      <Row>
        <Col span={8}>I am confident about my selection above</Col>
        <Col span={16}>
          <Form.Item name={`confidence_${questionIdx}`}>
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

      <Row>
        <Col span={8}>I understand why AI makes this prediction</Col>
        <Col span={16}>
          <Form.Item name={`understand_${questionIdx}`}>
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

      <Row>
        <Col span={8}>
          The AI explanation helps me assess the drug indication
        </Col>
        <Col span={16}>
          <Form.Item name={`helpful_${questionIdx}`}>
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

      <Row>
        <Col span={8}>
          I trust this AI to make predictions for drug repurposing
        </Col>
        <Col span={16}>
          <Form.Item name={`trust_${questionIdx}`}>
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
