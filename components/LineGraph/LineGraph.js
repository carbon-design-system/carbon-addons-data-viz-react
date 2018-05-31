import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import DataTooltip from '../DataTooltip/DataTooltip';
import _ from 'lodash';

const propTypes = {
  /**
   * If your data set has a single series, or multiple series with all the same x values, use the data prop, and format like this: [[y1a, y1b, ... , x1], [y2a, y2b, ... , x2], ...]
   */
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  /**
   * If your data set has multiple series with different x values, use the datasets prop, and format like this: [[[y1a, x1a], [y2a, x2a], ...], [[y1b, x1b], [y2b, x2b], ...], ...]
   */
  datasets: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
  ),
  /**
   * If your data set has multiple series, the seriesLabels array should contain strings labeling your series in the same order that your series appear in either data or datasets props.
   */
  seriesLabels: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.number,
  width: PropTypes.number,
  id: PropTypes.string,
  containerId: PropTypes.string,
  margin: PropTypes.object,
  labelOffsetX: PropTypes.number,
  labelOffsetY: PropTypes.number,
  axisOffset: PropTypes.number,
  timeFormat: PropTypes.string,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  onHover: PropTypes.func,
  onMouseOut: PropTypes.func,
  emptyText: PropTypes.string,
  isUTC: PropTypes.bool,
  color: PropTypes.array,
  drawLine: PropTypes.bool,
  animateAxes: PropTypes.bool,
  showTooltip: PropTypes.bool,
  showLegend: PropTypes.bool,
  formatValue: PropTypes.func,
  formatTooltipData: PropTypes.func,
  /**
   * Set this prop to false to prevent x values from being converted to time.
   */
  isXTime: PropTypes.bool,
};

const defaultProps = {
  data: [],
  datasets: [],
  seriesLabels: [],
  height: 300,
  width: 800,
  id: 'container',
  containerId: 'graph-container',
  margin: {
    top: 30,
    right: 20,
    bottom: 70,
    left: 65,
  },
  labelOffsetX: 65,
  labelOffsetY: 55,
  axisOffset: 16,
  timeFormat: '%I:%M:%S',
  xAxisLabel: 'X Axis',
  yAxisLabel: 'Y Axis',
  onHover: () => {},
  onMouseOut: () => {},
  formatValue: null,
  formatTooltipData: ({ data, seriesLabels, index, label, color }) => {
    return [
      {
        data: data[0],
        label:
          seriesLabels && seriesLabels.length ? seriesLabels[index] : label,
        color: color[index],
      },
    ];
  },
  emptyText:
    'There is currently no data available for the parameters selected. Please try a different combination.',
  isUTC: false,
  color: ['#00a68f', '#3b1a40', '#473793', '#3c6df0', '#56D2BB'],
  drawLine: true,
  animateAxes: true,
  showTooltip: true,
  showLegend: false,
  isXTime: true,
};

class LineGraph extends Component {
  componentDidMount() {
    const {
      data,
      datasets,
      width,
      height,
      margin,
      containerId,
      emptyText,
      showLegend,
      seriesLabels,
    } = this.props;

    if (data.length > 0) {
      this.totalLines = data[0].length - 1;
    } else if (datasets.length > 0) {
      this.totalLines = datasets.length;
    }

    this.emptyContainer = d3
      .select(`#${containerId} .bx--line-graph-empty-text`)
      .text(emptyText)
      .style('position', 'absolute')
      .style('top', '50%')
      .style('left', '50%')
      .style('text-align', 'center')
      .style('transform', 'translate(-50%, -50%)');

    this.svg = d3
      .select(`#${containerId} svg`)
      .attr('class', 'bx--graph')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'bx--group-container')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    this.width =
      width -
      (margin.left +
        margin.right +
        (showLegend && seriesLabels.length > 0
          ? 30 + _.max(seriesLabels.map(l => l.length)) * 8
          : 0));
    this.height = height - (margin.top + margin.bottom);

    this.initialRender();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.height != this.props.height ||
      nextProps.width != this.props.width
    ) {
      this.resize(nextProps.height, nextProps.width);
    }
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.data !== nextProps.data ||
      this.props.datasets !== nextProps.datasets
    );
  }

  componentWillUpdate(nextProps) {
    if (this.x) {
      const data =
        nextProps.data.length > 0
          ? nextProps.data
          : _.flatten(nextProps.datasets);
      this.x.domain(d3.extent(data, d => d[d.length - 1]));
      this.y.domain([0, d3.max(data, d => d3.max(d.slice(0, d.length - 1)))]);

      this.updateEmptyState(
        nextProps.data.length > 0 ? nextProps.data : nextProps.datasets
      );
      this.updateData(nextProps);
    }
  }

  updateEmptyState(data) {
    if (
      data[0]
        ? (!Array.isArray(data[0][0]) && data.length < 2) ||
          (Array.isArray(data[0][0]) && _.max(data.map(d => d.length)) < 2)
        : true
    ) {
      this.svg.style('opacity', '.3');
      this.emptyContainer.style('display', 'inline-block');
    } else {
      this.svg.style('opacity', '1');
      this.emptyContainer.style('display', 'none');
    }
  }

  updateData(nextProps) {
    const {
      data,
      datasets,
      axisOffset,
      xAxisLabel,
      yAxisLabel,
      animateAxes,
    } = nextProps;

    for (var i = 0; i < this.totalLines; i++) {
      this.svg.selectAll(`g[data-line="${i}"]`).remove();
    }

    if (data.length > 0) {
      this.totalLines = data[0].length - 1;
    } else if (datasets.length > 0) {
      this.totalLines = datasets.length;
    }

    if (animateAxes) {
      this.svg
        .select('.bx--axis--x')
        .transition()
        .call(this.xAxis)
        .selectAll('.bx--axis--x .tick text')
        .attr('y', axisOffset)
        .style('text-anchor', 'end')
        .attr('transform', `rotate(-65)`);

      this.svg
        .select('.bx--axis--y')
        .transition()
        .call(this.yAxis)
        .selectAll('text')
        .attr('x', -axisOffset);
    } else {
      this.svg
        .select('.bx--axis--x')
        .call(this.xAxis)
        .selectAll('.bx--axis--x .tick text')
        .attr('y', axisOffset)
        .style('text-anchor', 'end')
        .attr('transform', `rotate(-65)`);

      this.svg
        .select('.bx--axis--y')
        .call(this.yAxis)
        .selectAll('text')
        .attr('x', -axisOffset);
    }

    this.svg.select('.bx--axis--y .bx--graph-label').text(yAxisLabel);
    this.svg.select('.bx--axis--x .bx--graph-label').text(xAxisLabel);

    this.updateStyles();
  }

  updateStyles() {
    this.svg.selectAll('.bx--axis--y path').style('display', 'none');
    this.svg.selectAll('.bx--axis path').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick line').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick text').attr('fill', '#5A6872');
  }

  resize(height, width) {
    const { margin, containerId, showLegend, seriesLabels } = this.props;

    this.height = height - (margin.top + margin.bottom);
    this.width =
      width -
      (margin.left +
        margin.right +
        (showLegend && seriesLabels.length > 0
          ? 30 + _.max(seriesLabels.map(l => l.length)) * 8
          : 0));

    this.svg.selectAll('*').remove();

    this.svg = d3
      .select(`#${containerId} svg`)
      .attr('class', 'bx--graph')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'bx--group-container')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    this.initialRender();
  }

  initialRender() {
    const {
      data,
      datasets,
      timeFormat,
      formatValue,
      isUTC,
      isXTime,
      showLegend,
      seriesLabels,
    } = this.props;

    this.updateEmptyState(data.length > 0 ? data : datasets);

    const flatData = data.length > 0 ? data : _.flatten(datasets);

    if (isUTC) {
      this.x = d3
        .scaleUtc()
        .range([0, this.width])
        .domain(d3.extent(flatData, d => d[d.length - 1]));
    } else if (isXTime) {
      this.x = d3
        .scaleTime()
        .range([0, this.width])
        .domain(d3.extent(flatData, d => d[d.length - 1]));
    } else {
      this.x = d3
        .scaleLinear()
        .range([0, this.width])
        .domain(d3.extent(flatData, d => d[d.length - 1]));
    }

    this.y = d3
      .scaleLinear()
      .range([this.height, 0])
      .domain([
        0,
        d3.max(flatData, d => d3.max(d.slice(0, d.length - 1))) || 10,
      ]);

    this.line = d3
      .line()
      .x(d => this.x(d[d.length - 1]))
      .y(d => this.y(d[this.count]))
      .defined(d => !isNaN(d[this.count]));

    this.xAxis = d3
      .axisBottom()
      .scale(this.x)
      .tickSize(0)
      .tickFormat(isXTime ? d3.timeFormat(timeFormat) : null);

    this.yAxis = d3
      .axisLeft()
      .ticks(4)
      .tickSize(-this.width)
      .scale(this.y.nice());

    if (formatValue !== null) {
      this.yAxis.tickFormat(formatValue);
    }

    this.renderAxes();
    this.renderLabels();
    this.renderOverlay();

    if (this.x) {
      this.renderLine();
    }

    if (showLegend && seriesLabels.length > 0) {
      this.renderLegend();
    }
  }

  renderAxes() {
    const { axisOffset } = this.props;

    this.svg
      .append('g')
      .attr('class', 'bx--axis bx--axis--y')
      .attr('stroke-dasharray', '4')
      .call(this.yAxis)
      .selectAll('text')
      .attr('x', -axisOffset);

    this.svg
      .append('g')
      .attr('class', 'bx--axis bx--axis--x')
      .attr('transform', `translate(0, ${this.height})`)
      .call(this.xAxis)
      .selectAll('text')
      .attr('y', axisOffset)
      .style('text-anchor', 'end')
      .attr('transform', `rotate(-65)`);

    this.updateStyles();
  }

  renderLabels() {
    const { labelOffsetY, labelOffsetX, xAxisLabel, yAxisLabel } = this.props;

    this.svg
      .select('.bx--axis--y')
      .append('text')
      .text(`${yAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr(
        'transform',
        `translate(${-labelOffsetY}, ${this.height / 2}) rotate(-90)`
      );

    this.svg
      .select('.bx--axis--x')
      .append('text')
      .text(`${xAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr('transform', `translate(${this.width / 2}, ${labelOffsetX})`);

    this.svg
      .selectAll('.bx--graph-label')
      .attr('font-size', '10')
      .attr('font-weight', '700')
      .attr('fill', '#5A6872')
      .attr('text-anchor', 'middle');
  }

  renderLine() {
    const { data, datasets, drawLine } = this.props;
    const color = d3.scaleOrdinal(this.props.color);
    const hasData = data.length > 0;
    const numLines = hasData ? data[0].length - 1 : datasets.length;

    this.count = 0;
    if (hasData || _.max(datasets.map(d => d.length)) > 0) {
      for (let i = 0; i < numLines; i++) {
        const path = this.svg
          .append('g')
          .attr('data-line', i)
          .datum(hasData ? data : datasets[i])
          .append('path')
          .attr('class', 'bx--line')
          .attr('stroke', color(i))
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('pointer-events', 'none')
          .attr('d', this.line);

        var totalLength = path.node().getTotalLength();

        if (drawLine) {
          path
            .attr('stroke-dasharray', 0 + ' ' + totalLength)
            .transition()
            .ease(d3.easeSin)
            .duration(1000)
            .attr('stroke-dasharray', totalLength + ' ' + 0);
        } else {
          path
            .attr('stroke-dasharray', 0 + ' ' + totalLength)
            .attr('stroke-dasharray', totalLength + ' ' + 0);
        }

        this.count += hasData ? 1 : 0;
      }
    }
  }

  renderOverlay() {
    this.svg
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'overlay')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', () => {
        this.onMouseMove();
      })
      .on('mouseout', () => {
        this.onMouseOut();
      });
  }

  renderLegend() {
    const { seriesLabels } = this.props;
    let legendRectSize = 18;
    let legendSpacing = 4;

    let legend = this.svg
      .selectAll('.legend')
      .data(seriesLabels)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        const h = legendRectSize + legendSpacing;
        const offset = h * seriesLabels.length / 2;
        const horz = this.width + 10;
        const vert = i * h - offset + 50;
        return `translate(${horz},${vert})`;
      });

    legend
      .append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', (d, i) => this.props.color[i])
      .style('stroke', (d, i) => this.props.color[i]);

    legend
      .append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text((d, i) => seriesLabels[i]);
  }

  onMouseOut() {
    if (
      this.props.data.length > 2 ||
      _.max(this.props.datasets.map(d => d.length)) > 2
    ) {
      this.props.onMouseOut();
      if (this.tooltipId) {
        ReactDOM.unmountComponentAtNode(this.tooltipId);
      }
    }
  }

  onMouseMove() {
    if (!this.id) return null;

    const {
      margin,
      data,
      datasets,
      showTooltip,
      timeFormat,
      color,
      height,
      labelOffsetX,
      isXTime,
      seriesLabels,
      formatTooltipData,
    } = this.props;

    if (data.length > 2 || _.max(datasets.map(d => d.length)) > 2) {
      const bisectDate = d3.bisector(function(d) {
        return d[d.length - 1];
      }).right;
      const mouse = d3.mouse(this.id)[0] - margin.left;
      const timestamp = this.x.invert(mouse);
      let d, mouseData, tooltipHeading, tooltipData;
      if (data.length > 0) {
        const index = bisectDate(data, timestamp);
        const d0 = data[index - 1];
        const d1 = data[index];

        if (d0 && d1) {
          d =
            timestamp - d0[d0.length - 1] > d1[d1.length - 1] - timestamp
              ? d1
              : d0;

          mouseData = {
            data: d,
            pageX: d3.event.pageX,
            pageY: d3.event.pageY,
            graphX: this.x(d[d.length - 1]),
            graphY: this.y(d[0]),
            graphYArray: d.slice(0, -1).map(this.y),
          };

          tooltipHeading =
            d.length > 2
              ? isXTime
                ? d3.timeFormat(timeFormat)(d[d.length - 1])
                : d[d.length - 1]
              : null;

          tooltipData = formatTooltipData(
            Object.assign(mouseData, {
              index,
              label: tooltipHeading,
              seriesLabels,
              color,
            })
          );
        }
      } else {
        const mouseX = this.x(timestamp);
        const mouseY = d3.mouse(this.id)[1] - margin.top;
        const distances = [];
        d = _.sortBy(_.flatten(datasets), a => {
          const aDist =
            Math.pow(mouseX - this.x(a[a.length - 1]), 2) +
            Math.pow(mouseY - this.y(a[0]), 2);
          distances.push({ a, aDist });
          return aDist;
        })[0];
        const i = datasets.findIndex(set => set.includes(d));

        mouseData = {
          data: d,
          pageX: d3.event.pageX,
          pageY: d3.event.pageY,
          graphX: this.x(d[d.length - 1]),
          graphY: this.y(d[0]),
          graphYArray: d.slice(0, -1).map(this.y),
        };

        const xVal = isXTime
          ? d3.timeFormat(timeFormat)(d[d.length - 1])
          : d[d.length - 1];

        tooltipHeading = d.length > 2 ? xVal : null;

        tooltipData = formatTooltipData(
          Object.assign(mouseData, {
            index: i,
            label: tooltipHeading,
            seriesLabels,
            color,
          })
        );
      }

      this.props.onHover(mouseData);

      if (showTooltip && tooltipData && tooltipData.length > 0) {
        ReactDOM.render(
          <DataTooltip heading={tooltipHeading} data={tooltipData} />,
          this.tooltipId
        );
        const tooltipSize = d3
          .select(this.tooltipId.children[0])
          .node()
          .getBoundingClientRect();
        const offset = -tooltipSize.width / 2;
        d3
          .select(this.tooltipId)
          .style('position', 'relative')
          .style('left', `${mouseData.graphX + labelOffsetX + offset}px`)
          .style(
            'top',
            `${this.y(_.max(_.dropRight(d))) -
              height -
              tooltipSize.height +
              10}px`
          );
      }
    }
  }

  render() {
    const { id, containerId } = this.props;
    if (this.x) {
      this.renderLine();
    }

    return (
      <div
        className="bx--graph-container"
        id={containerId}
        style={{ position: 'relative' }}>
        <p className="bx--line-graph-empty-text" />
        <svg id={id} ref={id => (this.id = id)} />
        <div id={`${id}-tooltip`} ref={id => (this.tooltipId = id)} />
      </div>
    );
  }
}

LineGraph.propTypes = propTypes;
LineGraph.defaultProps = defaultProps;

export default LineGraph;
