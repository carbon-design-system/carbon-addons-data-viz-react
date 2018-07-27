import React, { Component } from 'react';
import { storiesOf, action } from '@storybook/react';
import LineGraph from './LineGraph';
import flatMap from 'lodash/flatMap';
import flatten from 'lodash/flatten';

const defaultDataSets = [
  [
    [1491, 1506816000000],
    [1644, 1509494400000],
    [1019, 1512086400000],
    [836, 1514764800000],
    [1009, 1517443200000],
    [1461, 1519862400000],
  ],
  [
    [185, 1506816000000],
    [120, 1509494400000],
    [55, 1512086400000],
    [89, 1514764800000],
    [109, 1517443200000],
    [61, 1519862400000],
  ],
  [
    [29.962162162162162, 1506816000000],
    [43.15833333333333, 1509494400000],
    [38.30909090909091, 1512086400000],
    [24.382022471910112, 1514764800000],
    [58.12, 1517443200000],
    [91.34, 1519862400000],
  ],
  [
    [5543, 1506816000000],
    [5179, 1509494400000],
    [2107, 1512086400000],
    [2170, 1514764800000],
    [3921, 1517443200000],
    [4389, 1519862400000],
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
      Array.from({ length: datasets[k].length }, (v, idx) => {
        return flatten([
          datasets[k][idx]
            .slice(0, datasets[k][idx].length - 1)
            .map((v, idx) => {
              if (idx % 2 === 0) {
                return v + Math.floor(Math.random() * 1000 + 1);
              }
              return Math.abs(v - Math.floor(Math.random() * 1000 + 1));
            }),
          datasets[k][idx][datasets[k][idx].length - 1],
        ]);
      })
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

let resizeInterval;
storiesOf('LineGraph', module)
  .addDecorator(next => {
    clearInterval(resizeInterval);
    return next();
  })
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
  .addWithInfo('Resizing', () => {
    const chartRef = React.createRef();

    resizeInterval = setInterval(() => {
      if (chartRef.current && typeof chartRef.current.resize === 'function') {
        const height = Math.max(300, Math.min(Math.random() * 1000, 550));
        const width = Math.max(650, Math.min(Math.random() * 1000, 900));
        chartRef.current.resize(height, width);
      }
    }, 3500);

    return (
      <LineGraph
        ref={chartRef}
        datasets={defaultDataSets}
        onHover={action('Hover')}
        onMouseOut={action('Mouseout')}
        onBlur={action('Blur')}
        seriesLabels={Array.from(
          { length: defaultDataSets.length },
          (v, k) => `Series ${k}`
        )}
        showLegend
        isXTime={false}
      />
    );
  })
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
      datasets={defaultDataSets}
      showTooltip
      showLegend
      seriesLabels={Array.from(
        { length: defaultDataSets.length },
        (v, k) => `Series ${k}`
      )}
      onHover={action('Hover')}
      onMouseOut={action('Mouseout')}
      onBlur={action('Blur')}
    />
  ))
  .addWithInfo('Number values for X', ` Static Example. `, () => (
    <LineGraph
      datasets={defaultDataSets}
      onHover={action('Hover')}
      onMouseOut={action('Mouseout')}
      onBlur={action('Blur')}
      seriesLabels={Array.from(
        { length: defaultDataSets.length },
        (v, k) => `Series ${k}`
      )}
      showLegend
      isXTime={false}
    />
  ))
  .addWithInfo('Logarithmic', ` Static Example. `, () => (
    <LineGraph
      datasets={defaultDataSets.reduce((acc, item) => {
        acc.push(item.slice(0, 2));
        return acc;
      }, [])}
      scaleType="log"
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
  .addWithInfo('Logairthmic - Updating', () => (
    <LineGraphContainer
      datasets={defaultDataSets}
      scaleType="log"
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
