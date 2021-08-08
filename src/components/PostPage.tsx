import React from 'react';
import { StateConsumer } from 'stores';
import { Row, Col, Form, Radio } from 'antd';

interface Props {
  condition: string;
}

const PostPage = (props: Props) => {
  const { condition } = props;
  return (
    <>
      <h2>This page is still under development...</h2>
      {/* <h2>About the condiction {condition}</h2> */}
      <Row>
        <Col span={8}>I understand how this AI predicts drug repurposing </Col>
        <Col span={16}>
          <Form.Item
            name={`overall_understand_${condition}`}
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

      <Row>
        <Col span={8}>I trust this AI to predict drug repurposing </Col>
        <Col span={16}>
          <Form.Item
            name={`overall_trust_${condition}`}
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

      <Row>
        <Col span={8}>
          This AI helps me assess drug candicates for drug repurposing
        </Col>
        <Col span={16}>
          <Form.Item
            name={`overall_helpfulness_${condition}`}
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

      <Row>
        <Col span={8}>I am willing to use this AI in future </Col>
        <Col span={16}>
          <Form.Item
            name={`overall_willingness_${condition}`}
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

export default StateConsumer(PostPage);
