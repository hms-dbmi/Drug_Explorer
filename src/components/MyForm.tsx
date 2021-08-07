import React from 'react';
import { PageHeader, Form } from 'antd';
import { StepPanel } from './StepPanel';
import { IDispatch, IState } from 'types';
import { StateConsumer } from 'stores';
import WelcomePage from 'components/Welcome';
import TaskPage from './TaskPage';
import { goPrev, goNext } from 'stores/actions';
import TutorialPage from './TutorialPage';
import PostPage from './PostPage';

interface Props {
  globalState: IState;
  dispatch: IDispatch;
  height: number;
}

function MyForm(props: Props) {
  const [stepForm] = Form.useForm();
  const { questions } = props.globalState;

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
    ...questions.map((_, i) => {
      return {
        step: i + 2,
        stage: 'task',
        content: <TaskPage questionIdx={i} />,
      };
    }),
    {
      step: questions.length + 2,
      stage: 'post',
      content: <PostPage />,
    },
  ];
  return (
    <div
      style={{
        background: 'white',
        padding: '10px',
        height: props.height,
        overflowY: 'scroll',
      }}
    >
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
