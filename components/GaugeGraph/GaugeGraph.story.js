import React from 'react';
import { storiesOf, action } from '@storybook/react';
import GaugeGraph from './GaugeGraph';

const props = {
  radius: 80,
  padding: 30,
  amount: 75,
  total: 100,
};

const halfGaugeProps = {
  gaugePercentages: [50, 75],
  size: 'half',
  radius: 80,
  padding: 30,
  amount: 25,
  total: 100,
  valueText: '25%',
  labelText: '25 out of 100GB',
};

const halfGaugePropsTwo = {
  gaugePercentages: [50, 75],
  size: 'half',
  radius: 80,
  padding: 30,
  amount: 75,
  total: 100,
  valueText: '75%',
  labelText: '75 out of 100GB',
};

storiesOf('GaugeGraph', module)
  .addWithInfo(
    'Default',
    `
      Gauge Graph.
    `,
    () => <GaugeGraph {...props} />
  )
  .addWithInfo(
    'Half',
    `
      Gauge Graph.
    `,
    () => (
      <div>
        <GaugeGraph id="one" {...halfGaugeProps} />
        <GaugeGraph id="two" {...halfGaugePropsTwo} />
      </div>
    )
  );
