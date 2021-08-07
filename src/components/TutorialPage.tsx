import React from 'react';
import { StateConsumer } from 'stores';

interface Props {}

const WelcomePage = (props: Props) => {
  return (
    <>
      <h2 style={{ margin: '5px' }}>
        A Short Tutorial Before Starting the Tasks
      </h2>
    </>
  );
};

export default StateConsumer(WelcomePage);
