import React, { Component } from 'react';
import { storiesOf, action } from '@storybook/react';
import LineGraph from './LineGraph';
import flatMap from 'lodash/flatMap';

const defaultDataSets = [
  [
    [328432, new Date('2018-01').valueOf()],
    [528432, new Date('2018-02').valueOf()],
    [128432, new Date('2018-03').valueOf()],
    [398432, new Date('2018-04').valueOf()],
    [728422, new Date('2018-05').valueOf()],
  ],
  [
    [48124, new Date('2018-01').valueOf()],
    [23842, new Date('2018-02').valueOf()],
    [13283, new Date('2018-03').valueOf()],
    [20031, new Date('2018-04').valueOf()],
    [81241, new Date('2018-05').valueOf()],
  ],
  [
    [54354123, new Date('2018-01').valueOf()],
    [23131991, new Date('2018-02').valueOf()],
    [53802919, new Date('2018-03').valueOf()],
    [90243290, new Date('2018-04').valueOf()],
    [58329310, new Date('2018-05').valueOf()],
  ],
  [
    [215, new Date('2018-01').valueOf()],
    [123, new Date('2018-02').valueOf()],
    [329, new Date('2018-03').valueOf()],
    [410, new Date('2018-04').valueOf()],
    [1231, new Date('2018-05').valueOf()],
  ],
  [
    [12, new Date('2018-01').valueOf()],
    [52, new Date('2018-02').valueOf()],
    [59, new Date('2018-03').valueOf()],
    [90, new Date('2018-04').valueOf()],
    [11, new Date('2018-05').valueOf()],
  ],
];

class LineGraphContainer extends Component {
  state = {
    data: this.createData(12).sort(function(a, b) {
      return a[a.length - 1] - b[b.length - 1];
    }),
    datasets: [],
  };

  static defaultProps = {
    datasets: [],
  };

  static getDerivedStateFromProps(props, state) {
    if (!state.datasets.length && props.datasets.length) {
      return { datasets: [].concat(props.datasets, state.datasets) };
    }
    return state;
  }

  componentDidMount() {
    let i = 0;
    this.interval = setInterval(() => {
      this.updateData(i);
      i++;
    }, 5000);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  createData(num) {
    let data = [];
    for (let i = 0; i < num; i++) {
      let tempArr = [];
      let d = new Date();
      let randomNum = Math.floor(Math.random() * 1000 + 1);
      let randomNumTwo = Math.floor(Math.random() * 1000 + 1);
      let randomNumThree = Math.floor(Math.random() * 1000 + 1);
      d = d.getTime() - i * 3000;
      tempArr.push(randomNum, randomNumTwo, randomNumThree, d);
      data.push(tempArr);
    }

    return data;
  }

  createDataset(num) {
    const { datasets } = this.props;
    return Array.from({ length: num }, (v, k) =>
      Array.from({ length: datasets[k].length }, (v, idx) => [
        Math.floor(Math.random() * 1000 + 1),
        datasets[k][idx][datasets[k][idx].length - 1],
      ])
    );
  }

  updateData(i) {
    let data = [];
    let datasets = [];
    if (this.props.datasets.length) {
      datasets = this.createDataset(this.props.datasets.length);
    } else {
      data = this.createData(12).sort(function(a, b) {
        return a[a.length - 1] - b[b.length - 1];
      });
    }

    this.setState({
      data: data,
      datasets: datasets,
      xAxisLabel: `${i}`,
      yAxisLabel: `${i}`,
    });
  }

  render() {
    const props = Object.assign({}, this.props, {
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
      data: !this.props.datasets.length ? this.state.data : [],
      datasets: this.state.datasets,
      onHover: action('Hover'),
      id: this.props.id,
      containerId: this.props.containerId,
      drawLine: this.props.drawLine,
      animateAxes: this.props.animateAxes,
    });

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
        <LineGraphContainer
          onHover={action('Hover')}
          onMouseOut={action('Mouseout')}
          onBlur={action('Blur')}
        />
        <LineGraphContainer
          id="two"
          containerId="test-two"
          onHover={action('Hover')}
          onMouseOut={action('Mouseout')}
          onBlur={action('Blur')}
        />
      </div>
    )
  )
  .addWithInfo(
    'Updating without drawing line',
    `
      Line Graph without draw line animation.
    `,
    () => (
      <div>
        <LineGraphContainer
          onHover={action('Hover')}
          onMouseOut={action('Mouseout')}
          onBlur={action('Blur')}
          drawLine={false}
        />
        <LineGraphContainer
          id="two"
          containerId="test-two"
          onHover={action('Hover')}
          onMouseOut={action('Mouseout')}
          onBlur={action('Blur')}
          drawLine={false}
        />
      </div>
    )
  )
  .addWithInfo(
    'Updating without animating axes',
    `
      Line Graph without axes animation.
    `,
    () => (
      <div>
        <LineGraphContainer
          onHover={action('Hover')}
          onMouseOut={action('Mouseout')}
          onBlur={action('Blur')}
          animateAxes={false}
        />
        <LineGraphContainer
          id="two"
          containerId="test-two"
          onHover={action('Hover')}
          onMouseOut={action('Mouseout')}
          onBlur={action('Blur')}
          animateAxes={false}
        />
      </div>
    )
  )
  .addWithInfo('Static', ` Static Example. `, () => (
    <LineGraph
      datasets={[
        [[43, 1507563000000], [27, 1507563900000], [33, 1507564800000]],
        [
          [48.633333333333, 1507563004000],
          [21, 1507563900140],
          [38, 1507564830000],
        ],
      ]}
      showTooltip={false}
      onHover={action('Hover')}
      onMouseOut={action('Mouseout')}
      onBlur={action('Blur')}
    />
  ))
  .addWithInfo('Number values for X', ` Static Example. `, () => (
    <LineGraph
      datasets={[
        [[45, 12], [23, 14], [33, 18], [31, 20], [12, 21]],
        [[48.633333333333, 11], [21, 15], [38, 16], [21, 19], [31, 21]],
      ]}
      onHover={action('Hover')}
      onMouseOut={action('Mouseout')}
      onBlur={action('Blur')}
      seriesLabels={['Series 1', 'Series 2']}
      showLegend
      isXTime={false}
    />
  ))
  .addWithInfo('Logarithmic', ` Static Example. `, () => (
    <LineGraph
      datasets={defaultDataSets}
      scaleType="linear"
      // onHover={action('Hover')}
      // onMouseOut={action('Mouseout')}
      // onBlur={action('Blur')}
      seriesLabels={Array.from(
        { length: defaultDataSets.length },
        (v, k) => `Series ${k}`
      )}
      showLegend
      hoverOverlay
      // multiValueTooltip
      timeFormat="%b"
      isXTime={true}
      // formatTooltipData={ ({ datasets, data, seriesLabels, label, color }) => {
      //   const dataSets = flatMap(
      //     datasets,
      //     v => v.filter(d => d.includes(data[data.length - 1]))
      //   );
      //   return dataSets.map((dataSet, idx) => ({
      //     data: dataSet[0],
      //     label:
      //       seriesLabels && seriesLabels.length ? seriesLabels[idx] : label,
      //     color: color[idx],
      //   }));
      // } }
    />
  ))
  .addWithInfo('Logairthmic - Updating', () => (
    <LineGraphContainer
      datasets={defaultDataSets}
      scaleType="linear"
      // onHover={action('Hover')}
      // onMouseOut={action('Mouseout')}
      // onBlur={action('Blur')}
      seriesLabels={Array.from(
        { length: defaultDataSets.length },
        (v, k) => `Series ${k}`
      )}
      showLegend
      hoverOverlay
      multiValueTooltip
      timeFormat="%b"
      isXTime={true}
      formatTooltipData={({ datasets, data, seriesLabels, label, color }) => {
        const dataSets = flatMap(datasets, v =>
          v.filter(d => d.includes(data[data.length - 1]))
        );
        return dataSets.map((dataSet, idx) => ({
          data: dataSet[0],
          label:
            seriesLabels && seriesLabels.length ? seriesLabels[idx] : label,
          color: color[idx],
        }));
      }}
    />
  ))
  .addWithInfo('Empty', ` Empty Example. `, () => (
    <LineGraph
      onHover={action('Hover')}
      onMouseOut={action('Mouseout')}
      onBlur={action('Blur')}
    />
  ));
