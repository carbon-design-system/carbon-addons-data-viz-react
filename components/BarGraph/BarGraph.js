import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import * as d3 from 'd3';
import _ from 'lodash';

const propTypes = {
  data: PropTypes.array,
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
  color: PropTypes.array,
};

const defaultProps = {
  data: [[12, 1507563900000]],
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
  emptyText:
    'There is currently no data available for the parameters selected. Please try a different combination.',
  color: ['#00A78F', '#3b1a40', '#473793', '#3c6df0', '#56D2BB'],
};

class BarGraph extends Component {
  componentDidMount() {
    const {
      data,
      width,
      height,
      margin,
      id,
      containerId,
      emptyText,
    } = this.props;

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
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    this.width = width - (margin.left + margin.right);
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

  componentWillUpdate(nextProps) {
    if (this.x) {
      this.x.domain(nextProps.data.map(d => d[1]));
      this.y.domain([0, d3.max(nextProps.data, d => d[0])]);

      this.updateEmptyState(nextProps.data);
      this.updateData(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  initialRender() {
    const { data, timeFormat, xScale, isUTC } = this.props;

    this.updateEmptyState(data);

    this.x = d3
      .scaleBand()
      .rangeRound([0, this.width])
      .domain(data.map(d => d[1]))
      .padding(0.1);

    this.y = d3
      .scaleLinear()
      .range([this.height, 0])
      .domain([0, d3.max(data, d => d[0])]);

    this.xAxis = d3
      .axisBottom()
      .scale(this.x)
      .tickSize(0)
      .tickFormat(d3.timeFormat(timeFormat));

    this.yAxis = d3
      .axisLeft()
      .ticks(4)
      .tickSize(-this.width)
      .scale(this.y.nice());

    this.renderAxes();
    this.renderLabels();
    // this.renderOverlay();

    if (this.x) {
      this.renderBars();
    }
  }

  renderAxes() {
    const { data, axisOffset, timeFormat } = this.props;

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
      .style('text-anchor', 'middle');

    this.updateStyles();
  }

  renderBars() {
    const { data } = this.props;
    const color = d3.scaleOrdinal(this.props.color);

    this.count = 0;
    for (let i = 0; i < data[0].length - 1; i++) {
      this.svg
        .append('g')
        .attr('class', 'bar-container')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => this.x(d[1]))
        .attr('y', d => this.height)
        .attr('height', 0)
        .attr('width', this.x.bandwidth())
        .attr('fill', color(i))
        .transition()
        .duration(500)
        .delay((d, i) => i * 50)
        .attr('y', d => this.y(d[0]))
        .attr('height', d => this.height - this.y(d[0]));

      this.count++;
    }
  }

  renderLabels() {
    const { labelOffsetY, labelOffsetX, xAxisLabel, yAxisLabel } = this.props;

    const yLabel = this.svg
      .select('.bx--axis--y')
      .append('text')
      .text(`${yAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr(
        'transform',
        `translate(${-labelOffsetY}, ${this.height / 2}) rotate(-90)`
      );

    const xLabel = this.svg
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

  resize(height, width) {
    const { margin, containerId } = this.props;

    this.height = height - (margin.top + margin.bottom);
    this.width = width - (margin.left + margin.right);

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

  updateData(nextProps) {
    const { data, axisOffset, xAxisLabel, yAxisLabel } = nextProps;

    this.svg.selectAll('g.bar-container').remove();

    this.svg
      .select('.bx--axis--y')
      .transition()
      .call(this.yAxis)
      .selectAll('text')
      .attr('x', -axisOffset);

    this.svg.select('.bx--axis--y .bx--graph-label').text(yAxisLabel);

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

  updateEmptyState(data) {
    const { emptyText } = this.props;

    if (data.length < 2) {
      this.svg.style('opacity', '.3');
      this.emptyContainer.style('display', 'inline-block');
    } else {
      this.svg.style('opacity', '1');
      this.emptyContainer.style('display', 'none');
    }
  }

  updateStyles() {
    this.svg.selectAll('.bx--axis--y path').style('display', 'none');
    this.svg.selectAll('.bx--axis path').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick line').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick text').attr('fill', '#5A6872');
  }

  render() {
    const { id, containerId } = this.props;

    if (this.x) {
      this.renderBars();
    }

    return (
      <div
        className="bx--graph-container"
        id={containerId}
        style={{ position: 'relative' }}>
        <p className="bx--bar-graph-empty-text" />
        <svg id={id} ref={id => (this.id = id)} />
      </div>
    );
  }
}

BarGraph.propTypes = propTypes;
BarGraph.defaultProps = defaultProps;

export default BarGraph;
