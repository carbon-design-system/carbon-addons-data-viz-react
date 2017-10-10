import React, { Component } from 'react';
import { storiesOf, action } from '@storybook/react';
import LineGraph from './LineGraph';

class LineGraphContainer extends Component {
  state = {
    data: this.createData(12).sort(function(a, b) {
      return a[1] - b[1];
    }),
  };

  componentDidMount() {
    let i = 0;
    setInterval(() => {
      this.updateData(i);
      i++;
    }, 5000);
  }

  createData(num) {
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

  updateData(i) {
    let randomNumber = Math.floor(Math.random() * 20) + 10;
    let data = this.createData(12).sort(function(a, b) {
      return a[1] - b[1];
    });

    this.setState({
      data,
      xAxisLabel: `${i}`,
      yAxisLabel: `${i}`,
    });
  }

  render() {
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
      timeFormat: '%I:%M:%S',
      yAxisLabel: this.state.yAxisLabel,
      xAxisLabel: this.state.xAxisLabel,
      data: this.state.data,
      onHover: action('Hover'),
      id: this.props.id,
      containerId: this.props.containerId,
    };

    return <LineGraph {...props} />;
  }
}

storiesOf('LineGraph', module)
  .addWithInfo(
    'Updating',
    `
      Line Graph.
    `,
    () => (
      <div>
        <LineGraphContainer />
        <LineGraphContainer id="two" containerId="test-two" />
      </div>
    )
  )
  .addWithInfo('Static', ` Static Example. `, () => (
    <LineGraph
      data={[
        [48.633333333333, 1507563000000],
        [49.933333333333, 1507563900000],
        [53.733333333333, 1507564800000],
      ]}
    />
  ))
  .addWithInfo('Empty', ` Empty Example. `, () => <LineGraph />);
