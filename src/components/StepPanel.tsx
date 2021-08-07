import React, { ReactElement } from 'react';
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
  currentStep: number;
  toNext: () => void;
  toPrev: () => void;
}

const StepPanel = (props: Props) => {
  const stages = ['user_info', 'tutorial', 'task', 'post'];
  const { currentStep, toNext, toPrev, steps } = props;
  return (
    <>
      {/* step nav */}
      <Steps current={stages.indexOf(steps[currentStep].stage)}>
        <Step title="User Info" icon={<UserOutlined />} />
        <Step title="Tutorial" icon={<SolutionOutlined />} />
        <Step
          title={`Tasks: ${Math.min(
            Math.max(0, currentStep - 1),
            steps.length - 3
          )}/${steps.length - 3}`}
          icon={<QuestionCircleOutlined />}
        />
        <Step title="Almost Done" icon={<SmileOutlined />} />
      </Steps>
      <Divider />

      {/* page content */}
      {steps.map((item) => (
        <div
          className={`steps-content ${item.step !== currentStep && 'hidden'}`}
        >
          {item.content}
        </div>
      ))}

      {/* button group */}
      <div className="steps-action" style={{ textAlign: 'center' }}>
        {currentStep < props.steps.length - 1 && (
          <Button type="primary" onClick={toNext}>
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        )}
        {/* {currentStep > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={toPrev}>
            Previous
          </Button>
        )} */}
      </div>
    </>
  );
};

export { StepPanel };
