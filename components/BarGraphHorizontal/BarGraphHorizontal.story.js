import React, { Component } from 'react';
import { storiesOf, action } from '@storybook/react';
import BarGraphHorizontal from './BarGraphHorizontal';

class UpdatingBarGraphHorizontalContainer extends Component {
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
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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
    let randomNum = Math.floor(Math.random() * 1000 * 1000 * 1000 + 1);
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

let data = createData(10);

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
  height: 550,
  width: 900,
  labelOffsetY: 55,
  labelOffsetX: 65,
  axisOffset: 16,
  yAxisLabel: 'Date',
  xAxisLabel: 'Amount ($)',
  onHover: action('Hover'),
  id: 'bar-graph-1',
  containerId: 'bar-graph-container',
};

let resizeInterval;

storiesOf('BarGraphHorizontal', module)
  .addDecorator(next => {
    clearInterval(resizeInterval);
    return next();
  })
  .addWithInfo('Default', 'Horizontal Bar Graph', () => (
    <BarGraphHorizontal
      onHover={action('Hover')}
      timeFormat="%b"
      data={data}
      {...props}
    />
  ))
  .addWithInfo(
    'Resizing',
    `
      Auto resizing Horizontal Bar Graph.
    `,
    () => {
      let componentRef;
      const Component = React.createElement(
        BarGraphHorizontal,
        {
          ref: element => (componentRef = element),
          onHover: action('Hover'),
          timeFormat: '%b',
          data,
          ...props,
        },
        null
      );

      resizeInterval = setInterval(() => {
        if (componentRef && typeof componentRef.resize === 'function') {
          const height = Math.max(300, Math.min(Math.random() * 1000, 550));
          const width = Math.max(650, Math.min(Math.random() * 1000, 900));
          componentRef.resize(height, width);
        }
      }, 2500);
      return Component;
    }
  )
  .addWithInfo(
    'Grouped',
    `
     Grouped Horizontal Bar Graph.
    `,
    () => (
      <BarGraphHorizontal
        timeFormat="%b"
        onHover={action('Hover')}
        data={groupedData}
        {...props}
      />
    )
  )
  .addWithInfo(
    'Updating',
    `
     Updating Horizontal Grouped Bar Graph.
    `,
    () => <UpdatingBarGraphHorizontalContainer />
  )
  .addWithInfo(
    'Empty',
    `
     Empty Horizontal Bar Graph.
    `,
    () => (
      <BarGraphHorizontal
        onHover={action('Hover')}
        data={singleData}
        {...props}
      />
    )
  );
