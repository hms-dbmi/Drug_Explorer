import React, { ReactElement, useState } from 'react';
import { Button, Steps, Divider } from 'antd';
import {
  UserOutlined,
  SolutionOutlined,
  QuestionCircleOutlined,
  SmileOutlined,
} from '@ant-design/icons';

const { Step } = Steps;

interface Props {
  steps: { step: number; stage: string; content: ReactElement }[];
}

const StepPanel = (props: Props) => {
  const [activeStep, setActiveStep] = useState(0);

  function next() {
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
  }

  function prev() {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
  }

  const stages = ['info', 'tutorial', 'task', 'post']

  return (
    <>
      <Steps current={stages.indexOf(props.steps[activeStep].stage)}>
        <Step title="User Info" icon={<UserOutlined />} />
        <Step title="Tutorial" icon={<SolutionOutlined />} />
        <Step
          title={`Tasks: ${Math.max(0, activeStep - 1)}/${
            props.steps.length - 2
          }`}
          icon={<QuestionCircleOutlined />}
        />
        <Step title="Done" icon={<SmileOutlined />} />
      </Steps>
      <Divider />

      {props.steps.map((item) => (
        <div
          className={`steps-content ${item.step !== activeStep && 'hidden'}`}
        >
          {item.content}
        </div>
      ))}
      <div className="steps-action" style={{ textAlign: 'center' }}>
        {activeStep < props.steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {activeStep === props.steps.length - 1 && (
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        )}
        {activeStep > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Previous
          </Button>
        )}
      </div>
    </>
  );
};

export { StepPanel };
