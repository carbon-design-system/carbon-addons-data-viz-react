import React from 'react';
import { storiesOf } from '@storybook/react';
import DataTooltip from './DataTooltip';

const singleNoColorData = [{ data: '$250.17' }];

const singleData = [
  { data: '$250.17', label: 'Feb 21, 10:35 AM', color: '#00a68f' },
];

const data = [
  { data: '$123.45', label: 'Jan', color: '#3b1a40' },
  { data: '$112.22', label: 'Feb', color: '#473793' },
  { data: '$250.17', label: 'Mar', color: '#3c6df0' },
  { data: '$123.45', label: 'Apr', color: '#00a68f' },
  {
    data: '$112.22',
    label: 'Long text to show what will happen when text is really long',
    color: '#48d4bb',
  },
  { data: '$250.17', label: 'Jun', color: '#9b82f3' },
];

const props = {
  heading: 'Label 2',
  direction: 'bottom',
  isActive: true,
};

storiesOf('DataTooltip', module)
  .addWithInfo(
    'Default',
    `
    Data Tooltip.
  `,
    () => <DataTooltip data={singleNoColorData} />
  )
  .addWithInfo(
    'Single',
    `
      Data Tooltip.
    `,
    () => <DataTooltip data={singleData} />
  )
  .addWithInfo(
    'Triple',
    `
      Data Tooltip.
    `,
    () => <DataTooltip data={data.slice(0, data.length - 3)} {...props} />
  )
  .addWithInfo(
    'Quad',
    `
      Data Tooltip.
    `,
    () => <DataTooltip data={data.slice(0, data.length - 2)} {...props} />
  )
  .addWithInfo(
    'Quint',
    `
        Data Tooltip.
      `,
    () => <DataTooltip data={data.slice(0, data.length - 1)} {...props} />
  )
  .addWithInfo(
    'Max',
    `
      Data Tooltip.
    `,
    () => <DataTooltip data={data} {...props} />
  );
