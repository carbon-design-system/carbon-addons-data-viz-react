import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as d3 from 'd3';
import DataTooltip from '../DataTooltip/DataTooltip';
import ReactDOM from 'react-dom';
import _ from 'lodash';

const propTypes = {
  data: PropTypes.array,
  id: PropTypes.string,
  containerId: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  color: PropTypes.array,
  margin: PropTypes.object,
  labelOffset: PropTypes.number,
  axisOffset: PropTypes.number,
  timeFormat: PropTypes.string,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  showTooltip: PropTypes.bool,
  emptyText: PropTypes.string,
  formatTooltipData: PropTypes.func,
  onHover: PropTypes.func,
};

const defaultProps = {
  id: 'container',
  containerId: 'graph-container',
  data: [[100, 10], [50, 20]],
  height: 300,
  width: 800,
  color: ['#00a68f'],
  margin: {
    top: 30,
    right: 20,
    bottom: 70,
    left: 65,
  },
  labelOffset: 55,
  axisOffset: 16,
  timeFormat: '%b',
  xAxisLabel: 'X Axis',
  yAxisLabel: 'Y Axis',
  showTooltip: true,
  onHover: () => {},
  formatTooltipData: ({ data, label, index, circle }) => {
    return [
      {
        data: data[0],
        index,
        label,
        color: circle.attr('fill'),
      },
    ];
  },
  emptyText:
    'There is currently no data available for the parameters selected. Please try a different combination.',
};

class BubbleChart extends Component {
  componentDidMount() {
    const { width, height, margin, containerId, emptyText } = this.props;

    this.emptyContainer = d3
      .select(`#${containerId} .bx--bar-graph-empty-text`)
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
      .attr('transform', `translate(${margin.left}, 0)`);

    this.color = d3.scaleOrdinal(this.props.color);

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

  componentWillUpdate(nextProps) {
    if (this.xScale) {
      const sortedData = nextProps.data.sort((a, b) => b[0] - a[0]);
      this.xScale.domain(sortedData.map(d => d[1]));

      this.updateEmptyState(nextProps.data);
      this.updateData(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  resize(height, width) {
    const { margin, containerId } = this.props;

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
    const { data, height, width } = this.props;
    const sortedData = data.sort((a, b) => b[0] - a[0]);
    this.xScale = d3
      .scaleBand()
      .range([0, width])
      .domain(sortedData.map(d => d[1]));

    this.yScale = d3.scaleLinear().range([height, 0]);

    this.renderAxes();
    this.renderLabels();
    this.renderPoints();
    this.updateEmptyState(data);
  }

  updateData(nextProps) {
    const { axisOffset, xAxisLabel } = nextProps;

    this.svg.selectAll('g.bubble-container').remove();

    this.svg
      .select('.bx--axis--x')
      .transition()
      .call(this.xAxis)
      .selectAll('.bx--axis--x .tick text')
      .attr('y', axisOffset)
      .style('text-anchor', 'middle');

    this.svg.select('.bx--axis--x .bx--graph-label').text(xAxisLabel);

    this.updateStyles();
  }

  renderAxes() {
    const { height, width, timeFormat, axisOffset } = this.props;

    this.xAxis = d3
      .axisBottom()
      .scale(this.xScale)
      .tickSize(0)
      .tickFormat(d => (timeFormat ? d3.timeFormat(d) : d));

    this.yAxis = d3
      .axisLeft()
      .ticks(4)
      .tickSize(-width)
      .scale(this.yScale.nice());

    this.svg
      .append('g')
      .attr('class', 'bx--axis bx--axis--y')
      .call(this.yAxis)
      .selectAll('text')
      .attr('x', -axisOffset);

    this.svg
      .append('g')
      .attr('class', 'bx--axis bx--axis--x')
      .attr('transform', `translate(0, ${height / 1.35 + axisOffset})`)
      .call(this.xAxis)
      .selectAll('text')
      .attr('y', axisOffset)
      .style('text-anchor', 'middle');
  }

  updateStyles() {
    this.svg.selectAll('.bx--axis--y path').style('display', 'none');
    this.svg.selectAll('.bx--axis--y .tick').style('display', 'none');
    this.svg.selectAll('.bx--axis path').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick line').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick text').attr('fill', '#5A6872');
  }

  renderLabels() {
    const { labelOffset, xAxisLabel, yAxisLabel, height, width } = this.props;

    this.svg
      .select('.bx--axis--y')
      .append('text')
      .text(`${yAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr(
        'transform',
        `translate(${-labelOffset}, ${height / 2}) rotate(-90)`
      );

    this.svg
      .select('.bx--axis--x')
      .append('text')
      .text(`${xAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr('transform', `translate(${width / 2}, ${labelOffset})`);

    this.svg
      .selectAll('.bx--graph-label')
      .attr('font-size', '10')
      .attr('font-weight', '700')
      .attr('fill', '#5A6872')
      .attr('text-anchor', 'middle');
  }

  renderPoints() {
    const { data, height, color } = this.props;
    const sortedData = data.sort((a, b) => b[0] - a[0]);
    const valuesMap = sortedData.map(d => d[0]);
    const valueTotals = d3.sum(valuesMap);
    const offset = d3.min([
      height * 0.7,
      d3.max(valuesMap) / valueTotals * 100,
    ]);
    this.svg
      .append('g')
      .attr('class', 'bubble-container')
      .selectAll('circle')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('data-point', (d, i) => `${i}-0`)
      .attr('cx', d => this.xScale(d[1]) + offset * 2)
      .attr('cy', height / 2)
      .attr('fill', color)
      .attr('r', 0)
      .transition()
      .duration(350)
      .delay((d, i) => i * 40)
      .attr('r', d =>
        d3.min([height * 0.7, Math.max(d[0] / valueTotals * 100, 5)])
      );

    this.svg
      .selectAll('circle')
      .on('mouseover', (d, i) => this.onMouseEnter(d, i))
      .on('mouseout', (d, i) => this.onMouseOut(d, i));
  }

  getMouseData(d, i) {
    let mouseData;

    if (d.key) {
      mouseData = {
        data: [d.key],
        index: d.index,
        group: d.group,
        label: d.itemLabel,
      };
    } else {
      mouseData = {
        data: [d[0][0] || d[0]],
        index: i,
        group: 0,
        label: d[1],
      };
    }

    return mouseData;
  }

  onMouseEnter(d, i) {
    const { timeFormat, showTooltip, formatTooltipData } = this.props;
    const mouseData = this.getMouseData(d, i);

    let circle = this.svg.select(
      `circle[data-point="${mouseData.index}-${mouseData.group}"]`
    );
    circle
      .transition()
      .duration(250)
      .attr('fill', () => d3.color(circle.attr('fill')).darker());

    this.props.onHover(mouseData);

    if (showTooltip) {
      if (timeFormat) {
        const format = d3.timeFormat(timeFormat);

        mouseData.label = format(mouseData.label);
      }
      const tooltipData = formatTooltipData(
        Object.assign(mouseData, { circle })
      );
      ReactDOM.render(<DataTooltip data={tooltipData} />, this.tooltipId);
      const tooltipSize = d3
        .select(this.tooltipId.children[0])
        .node()
        .getBoundingClientRect();

      const offsetY = tooltipSize.height / 2;
      const offsetX = tooltipSize.width / 2;
      const circleRadius = parseInt(circle.attr('r'), 10);
      const circleX = parseInt(circle.attr('cx'), 10);
      const circleY = parseInt(circle.attr('cy'), 10);
      const topPos = circleY - circleRadius - offsetY;
      const leftPos = circleX + offsetX;

      d3
        .select(this.tooltipId)
        .style('position', 'absolute')
        .style('z-index', 1)
        .style('left', `${leftPos}px`)
        .style('top', `${topPos}px`);
    }
  }

  onMouseOut(d, i) {
    const mouseData = this.getMouseData(d, i);

    let circle = this.svg.select(
      `circle[data-point="${mouseData.index}-${mouseData.group}"]`
    );

    circle
      .transition()
      .duration(250)
      .attr('fill', () => this.color(0));

    ReactDOM.unmountComponentAtNode(this.tooltipId);
  }

  updateEmptyState(data) {
    if (data.length < 2) {
      this.svg.style('opacity', '.3');
      this.emptyContainer.style('display', 'inline-block');
    } else {
      this.svg.style('opacity', '1');
      this.emptyContainer.style('display', 'none');
    }
  }

  render() {
    const { id, containerId } = this.props;

    if (this.xScale) {
      this.renderPoints();
    }

    return (
      <div
        className="bx--graph-container"
        id={containerId}
        style={{ position: 'relative' }}>
        <p className="bx--bar-graph-empty-text" />
        <svg id={id} ref={id => (this.id = id)} />
        <div id="tooltip-div" ref={id => (this.tooltipId = id)} />
      </div>
    );
  }
}

BubbleChart.propTypes = propTypes;
BubbleChart.defaultProps = defaultProps;

export default BubbleChart;
