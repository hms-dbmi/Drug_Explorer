import React from 'react';
import { PageHeader, Form, Input } from 'antd';
import { StepPanel } from './StepPanel';
import { IDispatch, IState } from 'types';
import { StateConsumer } from 'stores';
import WelcomePage from 'components/Welcome';
import TaskPage from './TaskPage';
import { goPrev, goNext } from 'stores/actions';
import TutorialPage from './TutorialPage';

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

  const toNext = () => goNext(props.dispatch);
  const toPrev = () => goPrev(props.dispatch);

  const steps = [
    {
      step: 0,
      stage: 'user_info',
      content: <WelcomePage />,
    },
    {
      step: 1,
      stage: 'tutorial',
      content: <TutorialPage />,
    },
    {
      step: 2,
      stage: 'task',
      content: <TaskPage step={2} />,
    },
    {
      step: 3,
      stage: 'task',
      content: <TaskPage step={3} />,
    },
    {
      step: 4,
      stage: 'post',
      content: <Step2Form />,
    },
  ];
  return (
    <div style={{ background: 'white', padding: '10px', height: props.height }}>
      <div style={{ width: '1200px', margin: 'auto' }}>
        <PageHeader
          title={<h1>AI-powered Drug Repurposing</h1>}
          // subTitle="Multi-Step form"
        />
        <Form
          form={stepForm}
          onFinish={onFinish}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <StepPanel
            steps={steps}
            currentStep={props.globalState.step}
            toNext={toNext}
            toPrev={toPrev}
          />
        </Form>
      </div>
    </div>
  );
}
export default StateConsumer(MyForm);
