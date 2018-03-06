import React from 'react';
import { storiesOf } from '@storybook/react';
import DataTooltip from './DataTooltip';

const singleNoColorData = [{ data: '$250.17' }];

const singleData = [
  { data: '$250.17', label: 'Feb 21, 10:35 AM', color: '#00a68f' },
];

const data = [
  { data: '5.3%', label: 'CPU', color: '#3b1a40' },
  { data: '8.9%', label: 'CPU', color: '#473793' },
  { data: '35.1%', label: 'CPU', color: '#3c6df0' },
  { data: '46.5%', label: 'CPU', color: '#00a68f' },
  {
    data: '0.2%',
    label: 'CPU',
    color: '#48d4bb',
  },
  { data: '$250.17', label: 'CPU', color: '#9b82f3' },
];

const props = {
  heading: 'Mar 1 @ 11:26 AM',
  direction: 'top',
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
    'Single, No Label',
    `
      Data Tooltip.
    `,
    () => <DataTooltip data={singleData} />
  )
  .addWithInfo(
    'Single',
    `
        Data Tooltip.
      `,
    () => <DataTooltip data={data.slice(0, data.length - 5)} {...props} />
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
