import React, { Component } from 'react';
import { storiesOf, action } from '@storybook/react';
import NegativeBarGraph from './NegativeBarGraph';

class UpdatingNegativeBarGraphContainer extends Component {
  state = {
    data: this.createGroupedData(4).sort(function(a, b) {
      return a[a.length - 1] - b[b.length - 1];
    }),
  };

  interval;

  componentDidMount() {
    let i = 0;
    this.interval = setInterval(() => {
      this.updateData(i);
      i++;
    }, 2500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  createGroupedData(num) {
    let data = [];
    for (let i = 0; i < num; i++) {
      let numArr = [];
      const multiplier = i % 2 === 0 ? -1 : 1;
      const one = Math.floor(Math.random() * 1000 * multiplier + 10);
      const two = Math.floor(Math.random() * 1000 * multiplier + 10);
      const three = Math.floor(Math.random() * 1000 * multiplier + 10);
      const four = Math.floor(Math.random() * 1000 * multiplier + 10);
      numArr.push(one, two, three, four);
      const entry = [numArr, i];
      data.push(entry);
    }
    return data;
  }

  updateData(i) {
    let data = this.createGroupedData(4).sort(function(a, b) {
      return a[a.length - 1] - b[b.length - 1];
    });

    this.setState({
      data,
      xAxisLabel: `${i}`,
      yAxisLabel: `${i}`,
    });
  }

  render() {
    const { data } = this.state;
    const props = {
      margin: {
        top: 30,
        right: 20,
        bottom: 75,
        left: 65,
      },
      height: 550,
      width: 900,
      axisOffset: 16,
      yAxisLabel: this.state.yAxisLabel,
      xAxisLabel: this.state.xAxisLabel,
      onHover: action('Hover'),
      timeFormat: '%b',
      id: this.props.id,
      containerId: this.props.containerId,
      drawLine: this.props.drawLine,
    };

    return <NegativeBarGraph data={data} {...props} />;
  }
}

function createData(num) {
  let data = [];
  for (let i = 0; i < num; i++) {
    let tempArr = [];
    const multiplier = i % 2 === 0 ? -1 : 1;
    let randomNum = Math.floor(Math.random() * 1000 * multiplier + 1);
    let d = new Date();
    d = d.setDate(d.getDate() + i * 30);
    tempArr.push([randomNum], d);
    data.push(tempArr);
  }
  return data;
}

function createGroupedData(num) {
  let data = [];
  for (let i = 0; i < num; i++) {
    let numArr = [];
    const multiplier = i % 2 === 0 ? -1 : 1;
    const one = Math.floor(Math.random() * 1000 * multiplier + 10);
    const two = Math.floor(Math.random() * 1000 * multiplier + 10);
    const three = Math.floor(Math.random() * 1000 * multiplier + 10);
    const four = Math.floor(Math.random() * 1000 * multiplier + 10);
    const five = Math.floor(Math.random() * 1000 * multiplier + 10);
    numArr.push(one, two, three, four, five);
    let d = new Date();
    d = d.setDate(d.getDate() - i * 30);
    const entry = [numArr, d];
    data.push(entry);
  }
  return data;
}

let data = createData(12);

let groupedData = createGroupedData(3);

let singleData = createData(1).sort(function(a, b) {
  return a[1] - b[1];
});

const props = {
  margin: {
    top: 30,
    right: 20,
    bottom: 75,
    left: 65,
  },
  height: 550,
  width: 900,
  axisOffset: 16,
  yAxisLabel: 'Date',
  xAxisLabel: 'Amount ($)',
  onHover: action('Hover'),
  timeFormat: '%b',
  id: 'bar-graph-1',
  containerId: 'bar-graph-container',
};

storiesOf('NegativeBarGraph', module)
  .addWithInfo(
    'Default',
    `
      Negative Bar Graph.
    `,
    () => (
      <NegativeBarGraph
        onHover={action('Hover')}
        formatValue={value => `$${value / 1000}`}
        data={data}
        {...props}
      />
    )
  )
  .addWithInfo(
    'Grouped',
    `
     Grouped Negative Bar Graph.
    `,
    () => (
      <NegativeBarGraph
        onHover={action('Hover')}
        data={groupedData}
        {...props}
      />
    )
  )
  .addWithInfo(
    'Grouped with Custom Labels',
    `
     Grouped Negative Bar Graph with custom labels.
    `,
    () => (
      <NegativeBarGraph
        {...props}
        onHover={action('Hover')}
        timeFormat={null}
        data={[
          [[6810753.913996485, -322316.83828169684], 'NEW YORK, NY, US'],
          [[-2029509.2509859744, 319256.4128819143], 'LONDON, GB'],
          [[-1180299.5624584288, 98796.86410370439], 'AUSTIN, TX, US'],
          [[-997409.8602056602, 301419.9550709436], 'DALLAS, TX, US'],
          [[1306600.6748098487, 82748.73011782495], 'DURHAM, NC, US'],
        ]}
        yAxisLabel="Amount ($)"
      />
    )
  )
  .addWithInfo(
    'Updating',
    `
     Updating Grouped Bar Graph.
    `,
    () => <UpdatingNegativeBarGraphContainer />
  )
  .addWithInfo(
    'Empty',
    `
     Empty Bar Graph.
    `,
    () => (
      <NegativeBarGraph
        onHover={action('Hover')}
        data={singleData}
        {...props}
      />
    )
  );
