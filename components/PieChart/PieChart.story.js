import React from 'react';
import { storiesOf, action } from '@storybook/react';
import PieChart from './PieChart';

const data = [
  ['Gryffindor', Math.floor(Math.random() * 100 + 1)],
  ['Slytherin', Math.floor(Math.random() * 100 + 1)],
  ['Ravenclaw', Math.floor(Math.random() * 100 + 1)],
  ['Hufflepuff', Math.floor(Math.random() * 100 + 1)],
  ['Teachers', Math.floor(Math.random() * 20 + 1)],
];

const props = {
  data: data,
};

storiesOf('PieChart', module).addWithInfo(
  'Default',
  `
      Pie Chart.
    `,
  () => <PieChart {...props} />
);
