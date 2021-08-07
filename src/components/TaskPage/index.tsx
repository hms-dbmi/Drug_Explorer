import React from 'react';
import { StateConsumer } from 'stores';
import { IDispatch, IState } from 'types';
import { Form, Radio, Row, Col } from 'antd';

interface Props {
  globalState: IState;
  dispatch: IDispatch;
  step: number;
}

const TaskPage = (props: Props) => {
  const { questions, nodeNameDict } = props.globalState;
  const { step } = props;
  const drugName =
      nodeNameDict['drug'] && nodeNameDict['drug'][questions[step - 2]['drug']],
    diseaseName =
      nodeNameDict['disease'] &&
      nodeNameDict['disease'][questions[step - 2]['disease']];
  return (
    <>
      <h3 style={{ margin: '5px' }}>
        For the <b>disease: {diseaseName}</b> and the <b>drug: {drugName}</b>,
      </h3>
      <h3 style={{ margin: '5px' }}>Here is the AI prediction</h3>
      <h3 style={{ margin: '5px' }}>
        please select the most possible relation you think
      </h3>

      <Form.Item name={`question_${step}`}>
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
          <Form.Item name={`confidence_${step}`}>
            <Radio.Group>
              <Radio value="indicatable">Strongly Disagree</Radio>
              <Radio value="note indicatable">Disagree</Radio>
              <Radio value="indicatable">Neutral</Radio>
              <Radio value="note indicatable">Agree</Radio>
              <Radio value="indicatable">Strongly Agree</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={8}>I understand why AI makes this prediction</Col>
        <Col span={16}>
          <Form.Item name={`understandable_${step}`}>
            <Radio.Group>
              <Radio value="indicatable">Strongly Disagree</Radio>
              <Radio value="note indicatable">Disagree</Radio>
              <Radio value="indicatable">Neutral</Radio>
              <Radio value="note indicatable">Agree</Radio>
              <Radio value="indicatable">Strongly Agree</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={8}>
          The AI explanation helps me assess the drug indication
        </Col>
        <Col span={16}>
          <Form.Item name={`helpful_${step}`}>
            <Radio.Group>
              <Radio value="indicatable">Strongly Disagree</Radio>
              <Radio value="note indicatable">Disagree</Radio>
              <Radio value="indicatable">Neutral</Radio>
              <Radio value="note indicatable">Agree</Radio>
              <Radio value="indicatable">Strongly Agree</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={8}>
          I trust this AI to make predictions for drug repurposing
        </Col>
        <Col span={16}>
          <Form.Item name={`trust_${step}`}>
            <Radio.Group>
              <Radio value="indicatable">Strongly Disagree</Radio>
              <Radio value="note indicatable">Disagree</Radio>
              <Radio value="indicatable">Neutral</Radio>
              <Radio value="note indicatable">Agree</Radio>
              <Radio value="indicatable">Strongly Agree</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default StateConsumer(TaskPage);
