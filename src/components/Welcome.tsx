import React from 'react';
import { StateConsumer } from 'stores';
import { IDispatch, IState } from 'types';
import { Form, Input, InputNumber, Radio } from 'antd';

interface Props {
  globalState: IState;
  dispatch: IDispatch;
}

const WelcomePage = (props: Props) => {
  return (
    <>
      <h2 style={{ margin: '5px' }}>Welcome the User Study!</h2>
      <Form.Item label="Age" name="age">
        <InputNumber />
      </Form.Item>
      <Form.Item label="Gender" name="gender">
        <Radio.Group>
          <Radio value="F">Female</Radio>
          <Radio value="M">Male</Radio>
          <Radio value="other">Other</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Expertise in Biomedicine" name="bio">
        <Input />
      </Form.Item>
      <Form.Item label="Expertise in ML" name="ml">
        <Input />
      </Form.Item>
      <Form.Item name="intro" label="Research Field">
        <Input.TextArea placeholder="Breif introduction about your research" />
      </Form.Item>
    </>
  );
};

export default StateConsumer(WelcomePage);
