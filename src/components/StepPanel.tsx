import React, { ReactElement } from 'react';
import { Button, Steps, Divider } from 'antd';
import {
  UserOutlined,
  SolutionOutlined,
  QuestionCircleOutlined,
  SmileOutlined,
} from '@ant-design/icons';

import WelcomePage from 'components/Welcome';
import TaskPage from './TaskPage';
import TutorialPage from './TutorialPage';
import PostPage from './PostPage';

const { Step } = Steps;

interface Props {
  steps: { step: number; stage: string }[];
  width: number;
  currentStep: number;
  numberOfQuestions: number;
  toNext: () => void;
  toPrev: () => void;
}

const StepPanel = (props: Props) => {
  const stages = ['user_info', 'tutorial', 'task', 'post'];
  const { currentStep, toNext, toPrev, steps, numberOfQuestions } = props;
  let content = <WelcomePage />;
  const item = steps[currentStep];
  if (item.stage === 'tutorial') content = <TutorialPage />;
  else if (item.stage === 'task')
    content = <TaskPage questionIdx={item.step - 2} width={props.width} />;
  else if (item.stage === 'post') content = <PostPage condition={''} />;

  const pageContent = (
    <div
      key={item.step}
      className={`steps-content ${item.step !== currentStep && 'hidden'}`}
    >
      {content}
    </div>
  );
  return (
    <>
      {/* step nav */}
      <Steps current={stages.indexOf(steps[currentStep].stage)}>
        <Step title="User Info" icon={<UserOutlined />} />
        <Step title="Tutorial" icon={<SolutionOutlined />} />
        <Step
          title={`Tasks: ${Math.min(
            Math.max(0, currentStep - 1),
            numberOfQuestions
          )}/${numberOfQuestions}`}
          icon={<QuestionCircleOutlined />}
        />
        <Step title="Almost Done" icon={<SmileOutlined />} />
      </Steps>
      <Divider />

      {pageContent}

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
