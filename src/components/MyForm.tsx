import React from 'react';
import { PageHeader, Form } from 'antd';
import { StepPanel } from './StepPanel';
import { IDispatch, IState } from 'types';
import { StateConsumer } from 'stores';
import { goPrev, goNext, initTaskPage, savePageAnswer } from 'stores/actions';

import { message } from 'antd';
import { postJSON } from 'stores/DataService';

interface Props {
  globalState: IState;
  dispatch: IDispatch;
  height: number;
}

function MyForm(props: Props) {
  const WIDTH = 1200;
  const [stepForm] = Form.useForm();
  const { questions, step } = props.globalState;

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

  const onFinish = () => {
    // save current answers
    let formData = stepForm.getFieldsValue();
    formData['step'] = props.globalState.step;
    // savePageAnswer(formData, props.dispatch);
    let { questions, answers } = props.globalState;
    answers.push(formData);

    postJSON({ questions, answers })
      .then(() => {
        message.success(
          <span>
            Your answers have been successfully submitted. <br /> Thank you!
          </span>,
          15
        );
      })
      .catch((error) => {
        message.error(
          <span>
            Oops, something went wrong :( <br /> Please contact us for
            assistence
          </span>
        );
      });
  };

  const toNext = async () => {
    try {
      const values = await stepForm.validateFields();
      console.log('Success:', values);
      goNext(props.dispatch);

      // if the next page is task page, query needed data
      if (step > 0 && step < questions.length + 1) {
        const { drug, disease } = questions[step - 1];
        initTaskPage(drug, disease, props.dispatch);
      }

      // save current answers
      let formData = stepForm.getFieldsValue();
      formData['step'] = props.globalState.step;
      savePageAnswer(formData, props.dispatch);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const toPrev = () => goPrev(props.dispatch);

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
