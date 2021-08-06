import React from 'react';
import { PageHeader, Form, Input } from 'antd';
import { StepPanel } from './StepPanel';
import { IDispatch, IState } from 'types';
import { StateConsumer } from 'stores';
import WelcomePage from 'components/Welcome';

interface Props {
  globalState: IState;
  dispatch: IDispatch;
  height: number;
}

function MyForm(props: Props) {
  const [stepForm] = Form.useForm();

  const Step1Form = () => {
    return (
      <>
        <Form.Item name="field1" label="Field1">
          <Input />
        </Form.Item>
      </>
    );
  };

  const Step2Form = () => {
    return (
      <>
        <Form.Item name="field2" label="Field2">
          <Input />
        </Form.Item>
      </>
    );
  };

  const onFinish = () => {
    const formData = stepForm.getFieldsValue();

    // POST the data to backend and show Notification
    console.log(formData);
  };

  const steps = [
    {
      step: 0,
      title: 'Welcome',
      content: <WelcomePage />,
    },
    {
      step: 1,
      title: 'Step1',
      content: <Step1Form />,
    },
    {
      step: 2,
      title: 'Step2',
      content: <Step2Form />,
    },
  ];
  console.info(props);
  return (
    <div style={{ background: 'white', padding: '10px', height: props.height }}>
      <div style={{ width: '800px', margin: 'auto' }}>
        <PageHeader
          title="AI-based Drug Repurposing"
          subTitle="Multi-Step form"
        />
        <Form
          form={stepForm}
          onFinish={onFinish}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <StepPanel steps={steps} />
        </Form>
      </div>
    </div>
  );
}
export default StateConsumer(MyForm);
