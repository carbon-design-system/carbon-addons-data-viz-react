import React, { Component } from 'react';
import { storiesOf, action } from '@storybook/react';
import NegativeBarGraph from './NegativeBarGraph';

class UpdatingNegativeBarGraphContainer extends Component {
  state = {
    data: this.createGroupedData(6).sort(function(a, b) {
      return a[a.length - 1] - b[b.length - 1];
    }),
  };

  componentDidMount() {
    let i = 0;
    setInterval(() => {
      this.updateData(i);
      i++;
    }, 5000);
  }

  createGroupedData(num) {
    let data = [];
    for (let i = 0; i < num; i++) {
      let numArr = [];
      const one = Math.floor(Math.random() * 1000 + 10);
      const two = Math.floor(Math.random() * 1000 + 10);
      const three = Math.floor(Math.random() * 1000 + 10);
      const four = Math.floor(Math.random() * 1000 + 10);
      numArr.push(one, two, three, four);
      let d = i;
      const entry = [numArr, d];
      data.push(entry);
    }
    return data;
  }

  updateData(i) {
    let data = this.createGroupedData(6).sort(function(a, b) {
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
      height: 300,
      width: 800,
      labelOffsetY: 55,
      labelOffsetX: 65,
      axisOffset: 16,
      yAxisLabel: this.state.yAxisLabel,
      xAxisLabel: this.state.xAxisLabel,
      onHover: action('Hover'),
      id: this.props.id,
      containerId: this.props.containerId,
      drawLine: this.props.drawLine,
    };

    return <BarGraphHorizontal data={data} {...props} />;
  }
}

function createData(num) {
  let data = [];
  for (let i = 0; i < num; i++) {
    let tempArr = [];
    let randomNum = Math.floor(Math.random() * 1000 + 1);
    if (i % 2 === 0) {
      randomNum = -randomNum;
    }
    let d = new Date();
    d = d.setDate(d.getDate() + i * 30);
    tempArr.push([randomNum], `Airbus ${i}`);
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
    const entry = [numArr, `Airbus ${i}`];
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
  labelOffsetY: 55,
  labelOffsetX: 65,
  axisOffset: 16,
  yAxisLabel: 'Airline',
  xAxisLabel: 'Amount ($)',
  onHover: action('Hover'),
  id: 'bar-graph-1',
  containerId: 'bar-graph-container',
};

storiesOf('NegativeBarGraph', module)
  .addWithInfo(
    'Default',
    `
      Negative Bar Graph.
    `,
    () => <NegativeBarGraph onHover={action('Hover')} data={data} {...props} />
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
        width={500}
        height={300}
        onHover={action('Hover')}
        data={[
          [[6810753.913996485, 322316.83828169684], 'NEW YORK, NY, US'],
          [[2029509.2509859744, 319256.4128819143], 'LONDON, GB'],
          [[1180299.5624584288, 98796.86410370439], 'AUSTIN, TX, US'],
          [[997409.8602056602, 301419.9550709436], 'DALLAS, TX, US'],
          [[1306600.6748098487, 82748.73011782495], 'DURHAM, NC, US'],
        ]}
        yAxisLabel="Amount ($)"
        xAxisLabel=""
        seriesLabels={['Fixed Rate', 'Dynamic Rate']}
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
