import React from 'react';
import { storiesOf } from '@storybook/react';
import GaugeGraph from './GaugeGraph';

const props = {
  radius: 80,
  padding: 30,
  amount: 75,
  total: 100,
};

const halfGaugeProps = {
  gaugePercentages: [
    { low: 0, high: 50, color: '#4B8400' },
    { low: 50, high: 75, color: '#EFC100' },
    { low: 75, high: 100, color: '#FF5050' },
  ],
  size: 'half',
  radius: 80,
  padding: 30,
  amount: 25,
  total: 100,
  valueText: '25%',
  labelText: '25 out of 100GB',
  tooltipId: 'one-container',
};

const halfGaugePropsTwo = {
  gaugePercentages: [
    { low: 0, high: 50, color: '#4B8400' },
    { low: 50, high: 75, color: '#EFC100' },
    { low: 75, high: 100, color: '#FF5050' },
  ],
  size: 'half',
  radius: 80,
  padding: 30,
  amount: 75,
  total: 100,
  valueText: '75%',
  labelText: '75 out of 100GB',
  tooltipId: 'two-container',
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
