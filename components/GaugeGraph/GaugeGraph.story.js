import React from 'react';
import { storiesOf, action } from '@storybook/react';
import GaugeGraph from './GaugeGraph';

const props = {
  radius: 80,
  padding: 30,
  amount: 75,
  total: 100,
};

storiesOf('GaugeGraph', module).addWithInfo(
  'Default',
  `
      Gauge Graph.
    `,
  () => <GaugeGraph {...props} />
);
