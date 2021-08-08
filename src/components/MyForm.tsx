import React from 'react';
import { PageHeader, Form } from 'antd';
import { StepPanel } from './StepPanel';
import { IDispatch, IState } from 'types';
import { StateConsumer } from 'stores';
import { goPrev, goNext, initTaskPage } from 'stores/actions';

import { message } from 'antd';

interface Props {
  globalState: IState;
  dispatch: IDispatch;
  height: number;
}

function MyForm(props: Props) {
  const WIDTH = 1200;
  const [stepForm] = Form.useForm();
  const { questions, step } = props.globalState;

  const onFinish = () => {
    const formData = stepForm.getFieldsValue();

    // POST the data to backend and show Notification
    console.log(formData);
    message.success(
      <span>
        Your answers have been successfully submitted. <br /> Thank you!
      </span>,
      15
    );
  };

  const toNext = () => {
    goNext(props.dispatch);
    if (step > 0 && step < questions.length + 1) {
      // the next page is task page
      const { drug, disease } = questions[step - 1];
      initTaskPage(drug, disease, props.dispatch);
    }
  };
  const toPrev = () => goPrev(props.dispatch);

  const steps = [
    {
      step: 0,
      stage: 'user_info',
    },
    {
      step: 1,
      stage: 'tutorial',
    },
    ...questions.map((_, i) => {
      return {
        step: i + 2,
        stage: 'task',
      };
    }),
    {
      step: questions.length + 2,
      stage: 'post',
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
      <div style={{ width: WIDTH, margin: 'auto' }}>
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
            width={WIDTH}
            numberOfQuestions={questions.length}
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
