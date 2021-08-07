import React from 'react';
import { StateConsumer } from 'stores';
import { IDispatch, IState } from 'types';
import { Form, Input, Radio, Row, Col } from 'antd';

interface Props {
  globalState: IState;
  dispatch: IDispatch;
}

const TaskPage = (props: Props) => {
  return (
    <>
      <h3 style={{ margin: '5px' }}>
        For the drug xxx{} and the disease xxxx{}, here is the AI prediction
      </h3>

      <h3 style={{ margin: '5px' }}>
        please select the most possible relation you think
      </h3>

      <Form.Item name="gender">
        <Radio.Group>
          <Radio value="indicatable">Indicatable</Radio>
          <Radio value="note indicatable">Not indicatable</Radio>
          {/* <Radio value="other">Other</Radio> */}
        </Radio.Group>
      </Form.Item>

      <h4 style={{ margin: '5px' }}>
        Please rate your confidence level for your selection above
      </h4>
      <Row>
        <Col span={8}>I am confident about my selection above</Col>
        <Col span={16}>
          <Form.Item name="gender">
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
