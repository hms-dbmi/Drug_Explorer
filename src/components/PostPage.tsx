import React from 'react';
import { StateConsumer } from 'stores';

interface Props {}

const PsotPage = (props: Props) => {
  return (
    <>
      <h2 style={{ margin: '5px' }}>Thank you!</h2>
    </>
  );
};

export default StateConsumer(PsotPage);
