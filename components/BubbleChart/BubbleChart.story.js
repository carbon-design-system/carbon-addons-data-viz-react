import React, { PureComponent } from 'react';
import { storiesOf, action } from '@storybook/react';
import BubbleChart from './BubbleChart';

class UpdatingBubbleChartContainer extends PureComponent {
  state = {
    data: this.createData(5),
  };

  componentDidMount() {
    let i = 0;
    setInterval(() => {
      this.updateData(i);
      i++;
    }, 2500);
  }

  createData(num) {
    let data = [];
    for (let i = 0; i < num; i++) {
      let tempArr = [];
      let d = new Date();
      let randomNum = Math.floor(Math.random() * 1000 + 1);
      d = d.setDate(d.getDate() - i * 30);
      tempArr.push(randomNum, `Airbus ${i}`);
      data.push(tempArr);
    }

    return data;
  }

  updateData(i) {
    let data = this.createData(6);
    action('Update');
    this.setState({
      data,
      xAxisLabel: `${i}`,
      yAxisLabel: `${i}`,
    });
  }

  render() {
    const { data } = this.state;
    const props = {
      data,
      margin: {
        top: 30,
        right: 20,
        bottom: 70,
        left: 35,
      },
      height: 300,
      width: 800,
      labelOffset: 55,
      axisOffset: 16,
      xAxisLabel: 'Airline',
      yAxisLabel: 'USAGE ($)',
      timeFormat: null,
    };

    return <BubbleChart {...props} />;
  }
}

function createData(num) {
  let data = [];
  for (let i = 0; i < num; i++) {
    let tempArr = [];
    let d = new Date();
    let randomNum = Math.floor(Math.random() * 1000 + 1);
    d = d.setDate(d.getDate() - i * 30);
    tempArr.push(randomNum, `Airbus ${i}`);
    data.push(tempArr);
  }

  return data;
}

let data = createData(5);
const props = {
  data: data,
  margin: {
    top: 30,
    right: 20,
    bottom: 70,
    left: 65,
  },
  height: 300,
  width: 325,
  labelOffset: 55,
  axisOffset: 16,
  xAxisLabel: 'Airline',
  yAxisLabel: 'USAGE ($)',
  timeFormat: null,
};

storiesOf('BubbleChart', module)
  .addWithInfo(
    'Default',
    `
      Line Graph.
    `,
    () => <BubbleChart onHover={action('Hover')} {...props} />
  )
  .addWithInfo(
    'Updating',
    `
     Updating Bubble Chart.
    `,
    () => <UpdatingBubbleChartContainer />
  );
