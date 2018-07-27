import React, { PureComponent } from 'react';
import { storiesOf, action } from '@storybook/react';
import BubbleChart from './BubbleChart';

class UpdatingBubbleChartContainer extends PureComponent {
  state = {
    data: this.createData(6).sort((a, b) => b[0] - a[0]),
  };

  updateInterval;

  componentDidMount() {
    let i = 0;
    this.updateInterval = setInterval(() => {
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
      tempArr.push(randomNum, d);
      data.push(tempArr);
    }

    return data;
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval);
  }

  updateData(i) {
    let data = this.createData(6).sort((a, b) => b[0] - a[0]);
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
        left: 65,
      },
      height: 450,
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
    let randomNum = Math.floor(Math.random() * 1000 + 1);
    data.push([randomNum, i]);
  }

  return data;
}

const data = createData(7).sort((a, b) => b[0] - a[0]);
const props = {
  margin: {
    top: 30,
    right: 20,
    bottom: 70,
    left: 65,
  },
  height: 450,
  width: 800,
  labelOffset: 55,
  axisOffset: 16,
  xAxisLabel: 'Airline',
  formatValue: value => `$${value / 10}`,
  formatTooltipData: ({ data, label, index, circle }) => {
    return [
      {
        data: `$${data[0] / 10}`,
        index,
        label,
        color: circle.attr('fill'),
      },
    ];
  },
  timeFormat: null,
};

let resizeInterval;
storiesOf('BubbleChart', module)
  .addDecorator(next => {
    clearInterval(resizeInterval);
    return next();
  })
  .addWithInfo(
    'Default',
    `
      Bubble Chart.
    `,
    () => <BubbleChart data={data} onHover={action('Hover')} {...props} />
  )
  .addWithInfo(
    'Resizing',
    `
      Resizing Bubble Chart.
    `,
    () => {
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
        <BubbleChart
          ref={chartRef}
          data={data}
          onHover={action('Hover')}
          {...props}
        />
      );
    }
  )
  .addWithInfo(
    'Updating',
    `
     Updating Bubble Chart.
    `,
    () => <UpdatingBubbleChartContainer />
  );
