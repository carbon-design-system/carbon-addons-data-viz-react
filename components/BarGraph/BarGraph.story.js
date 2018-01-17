import React from 'react';
import { storiesOf, action } from '@storybook/react';
import BarGraph from './BarGraph';

function createData(num) {
  let data = [];
  for (let i = 0; i < num; i++) {
    let tempArr = [];
    let d = new Date();
    let randomNum = Math.floor(Math.random() * 1000 + 1);
    d = d.setDate(d.getDate() - i * 30);
    tempArr.push(randomNum, d);
    data.push(tempArr);
  }

  return data;
}

let data = createData(12).sort(function(a, b) {
  return a[1] - b[1];
});

const props = {
  margin: {
    top: 30,
    right: 20,
    bottom: 75,
    left: 65,
  },
  height: 300,
  width: 800,
  labelOffsetY: 55,
  labelOffsetX: 65,
  axisOffset: 16,
  timeFormat: '%b',
  yAxisLabel: 'Amount ($)',
  xAxisLabel: 'Date',
  data: data,
  onHover: action('Hover'),
  id: 'bar-graph-1',
  containerId: 'bar-graph-container',
};

storiesOf('BarGraph', module).addWithInfo(
  'Default',
  `
      Bar Graph.
    `,
  () => <BarGraph onHover={action('Hover')} {...props} />
);
