import React from 'react';
import { storiesOf, action } from '@storybook/react';
import LineGraph from './LineGraph';

function createData(num) {
  let data = [];
  for (let i = 0; i < num; i++) {
    let tempArr = [];
    let d = new Date();
    let randomNum = Math.floor(Math.random() * 1000 + 1);
    d = d.getTime() - i * 3000;
    tempArr.push(randomNum, d);
    data.push(tempArr);
  }

  return data;
}

let data = createData(12).sort(function(a, b) {
  return a[1] - b[1];
});
const props = {
  data: data,
  margin: {
    top: 30,
    right: 20,
    bottom: 70,
    left: 65,
  },
  height: 300,
  width: 800,
  labelOffset: 55,
  axisOffset: 16,
  timeFormat: '%I:%M:%S',
};

storiesOf('LineGraph', module).addWithInfo(
  'Default',
  `
      Line Graph.
    `,
  () => <LineGraph onHover={action('Hover')} {...props} />
);
