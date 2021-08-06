import React, { ReactElement, useState } from 'react';
import { Button, Steps } from 'antd';

interface Props {
  steps: { step: number; title: string; content: ReactElement }[];
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

  return (
    <>
      <Steps current={activeStep} style={{ width: 400 }}>
        {props.steps.map((item) => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>
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
