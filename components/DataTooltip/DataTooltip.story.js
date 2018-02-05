import React from 'react';
import { storiesOf } from '@storybook/react';
import DataTooltip from './DataTooltip';

const singleNoColorData = [{ data: '$250.17' }];

const singleData = [{ data: '$250.17', label: 'Jan', color: '#3b1a40' }];

const tripleData = [
  { data: '$123.45', label: 'Jan', color: '#3b1a40' },
  { data: '$112.22', label: 'Feb', color: '#473793' },
  { data: '$250.17', label: 'Mar', color: '#3c6df0' },
];

const quadData = [
  { data: '$123.45', label: 'Jan', color: '#3b1a40' },
  { data: '$112.22', label: 'Feb', color: '#473793' },
  { data: '$250.17', label: 'Mar', color: '#3c6df0' },
  { data: '$123.45', label: 'Apr', color: '#00a68f' },
];

const maxData = [
  { data: '$123.45', label: 'Jan', color: '#3b1a40' },
  { data: '$112.22', label: 'Feb', color: '#473793' },
  { data: '$250.17', label: 'Mar', color: '#3c6df0' },
  { data: '$123.45', label: 'Apr', color: '#00a68f' },
  { data: '$112.22', label: 'May', color: '#48d4bb' },
  { data: '$250.17', label: 'Jun', color: '#9b82f3' },
];

const props = {
  heading: 'January',
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
    () => <DataTooltip data={tripleData} {...props} />
  )
  .addWithInfo(
    'Quad',
    `
      Data Tooltip.
    `,
    () => <DataTooltip data={quadData} {...props} />
  )
  .addWithInfo(
    'Max',
    `
      Data Tooltip.
    `,
    () => <DataTooltip data={maxData} {...props} />
  );
