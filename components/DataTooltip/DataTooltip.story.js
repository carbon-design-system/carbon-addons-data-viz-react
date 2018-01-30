import React from 'react';
import { storiesOf } from '@storybook/react';
import DataTooltip from './DataTooltip';

storiesOf('DataTooltip', module).addWithInfo(
  'Default',
  `
      Data Tooltip.
    `,
  () => <DataTooltip />
);
