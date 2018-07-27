import React, { Component } from 'react';
import { storiesOf, action } from '@storybook/react';
import BarGraph from './BarGraph';

class UpdatingBarGraphContainer extends Component {
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
      timeFormat: '%b',
      id: this.props.id,
      containerId: this.props.containerId,
      drawLine: this.props.drawLine,
    };

    return <BarGraph data={data} {...props} />;
  }
}

function createData(num) {
  let data = [];
  for (let i = 0; i < num; i++) {
    let tempArr = [];
    let randomNum = Math.floor(Math.random() * 1000 + 1);
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
    const one = Math.floor(Math.random() * 1000 + 10);
    const two = Math.floor(Math.random() * 1000 + 10);
    const three = Math.floor(Math.random() * 1000 + 10);
    const four = Math.floor(Math.random() * 1000 + 10);
    const five = Math.floor(Math.random() * 1000 + 10);
    numArr.push(one, two, three, four, five);
    let d = new Date();
    d = d.setDate(d.getDate() - i * 30);
    const entry = [numArr, d];
    data.push(entry);
  }
  return data;
}

let data = createData(12).sort(function(a, b) {
  return a[1] - b[1];
});

let groupedData = createGroupedData(3).sort(function(a, b) {
  return a[1] - b[1];
});

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
  height: 300,
  width: 800,
  labelOffsetY: 55,
  labelOffsetX: 65,
  axisOffset: 16,
  yAxisLabel: 'Amount ($)',
  xAxisLabel: 'Date',
  onHover: action('Hover'),
  id: 'bar-graph-1',
  containerId: 'bar-graph-container',
};

let resizeInterval;
storiesOf('BarGraph', module)
  .addDecorator(next => {
    clearInterval(resizeInterval);
    return next();
  })
  .addWithInfo(
    'Default',
    `
      Bar Graph.
    `,
    () => (
      <BarGraph
        timeFormat="%b"
        formatValue={value => `$${value / 1000}k`}
        formatTooltipData={({ data, seriesLabels, label, index, rect }) => [
          {
            data: `$${data[0]}`,
            label:
              seriesLabels && seriesLabels.length ? seriesLabels[index] : label,
            color: rect.attr('fill'),
          },
        ]}
        onHover={action('Hover')}
        data={data}
        {...props}
      />
    )
  )
  .addWithInfo(
    'Grouped',
    `
     Grouped Bar Graph.
    `,
    () => (
      <BarGraph
        timeFormat="%b"
        onHover={action('Hover')}
        data={groupedData}
        {...props}
        seriesLabels={[
          'Series 1',
          'Series 2',
          'Series 3',
          'Series 4',
          'Series 5',
        ]}
      />
    )
  )
  .addWithInfo(
    'Grouped with Custom Labels',
    `
     Grouped Bar Graph with custom labels.
    `,
    () => (
      <BarGraph
        onHover={action('Hover')}
        data={[
          [[681, 214], 'NEW YORK, NY, US'],
          [[202, 218], 'LONDON, GB'],
          [[118, 182], 'AUSTIN, TX, US'],
          [[409, 12], 'DALLAS, TX, US'],
          [[10, 85], 'DURHAM, NC, US'],
        ]}
        formatValue={value => `$${value / 1000}k`}
        formatTooltipData={({ data, seriesLabels, label, index, rect }) => [
          {
            data: `$${data[0]}`,
            label:
              seriesLabels && seriesLabels.length ? seriesLabels[index] : label,
            color: rect.attr('fill'),
          },
        ]}
        yAxisLabel="Amount ($)"
        xAxisLabel=""
        seriesLabels={['Fixed Rate', 'Dynamic Rate']}
      />
    )
  )
  .addWithInfo('Resizing', () => {
    const chartRef = React.createRef();

    resizeInterval = setInterval(() => {
      if (chartRef.current && typeof chartRef.current.resize === 'function') {
        const height = Math.max(
          Math.min(Math.random() * 1000, props.height),
          300
        );
        const width = Math.max(
          Math.min(Math.random() * 1000, props.width),
          300
        );
        chartRef.current.resize(height, width);
      }
    }, 3500);

    return (
      <BarGraph
        ref={chartRef}
        onHover={action('Hover')}
        data={[
          [[681, 214], 'NEW YORK, NY, US'],
          [[202, 218], 'LONDON, GB'],
          [[118, 182], 'AUSTIN, TX, US'],
          [[409, 12], 'DALLAS, TX, US'],
          [[10, 85], 'DURHAM, NC, US'],
        ]}
        formatValue={value => `$${value / 1000}k`}
        formatTooltipData={({ data, seriesLabels, label, index, rect }) => [
          {
            data: `$${data[0]}`,
            label:
              seriesLabels && seriesLabels.length ? seriesLabels[index] : label,
            color: rect.attr('fill'),
          },
        ]}
        yAxisLabel="Amount ($)"
        xAxisLabel=""
        seriesLabels={['Fixed Rate', 'Dynamic Rate']}
      />
    );
  })
  .addWithInfo(
    'Updating',
    `
     Updating Grouped Bar Graph.
    `,
    () => <UpdatingBarGraphContainer />
  )
  .addWithInfo(
    'Empty',
    `
     Empty Bar Graph.
    `,
    () => <BarGraph onHover={action('Hover')} data={singleData} {...props} />
  );
