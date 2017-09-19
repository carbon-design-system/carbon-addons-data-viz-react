import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import * as d3 from 'd3';

const propTypes = {
  data: PropTypes.array,
  height: PropTypes.number,
  width: PropTypes.number,
  margin: PropTypes.object,
  labelOffset: PropTypes.number,
  axisOffset: PropTypes.number,
  timeFormat: PropTypes.string,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
};

const defaultProps = {
  data: [[100, 10], [50, 20]],
  height: 300,
  width: 800,
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
};

class ScatterPlot extends Component {
  state = {
    data: this.props.data,
    height: this.props.height,
    width: this.props.width,
    margin: this.props.margin,
    labelOffset: this.props.labelOffset,
    axisOffset: this.props.axisOffset,
    timeFormat: this.props.timeFormat,
    xAxisLabel: this.props.xAxisLabel,
    yAxisLabel: this.props.yAxisLabel,
  };

  componentDidMount() {
    const { data, width, height, margin } = this.state;

    this.svg = d3
      .select(this.refs.container)
      .attr('class', 'bx--graph')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'bx--group-container')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    this.setState(() => {
      return {
        width: width - (margin.left + margin.right),
        height: height - (margin.top + margin.bottom),
      };
    }, this.initialRender);
  }

  initialRender() {
    const { data, width, height } = this.state;

    this.x = d3.scaleBand().rangeRound([0, width]).domain(data.map(d => d[1]));

    this.y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d[0])]);

    this.renderAxes();
    this.renderLabels();
    this.renderPoints();
    this.renderOverlay();
  }

  renderAxes() {
    const { data, width, height, axisOffset, timeFormat } = this.state;

    const xAxis = d3
      .axisBottom()
      .scale(this.x)
      .tickSize(0)
      .tickFormat(d3.timeFormat(timeFormat));

    const yAxis = d3.axisLeft().ticks(4).tickSize(-width).scale(this.y.nice());

    this.svg
      .append('g')
      .attr('class', 'bx--axis bx--axis--y')
      .attr('stroke-dasharray', '4')
      .call(yAxis)
      .selectAll('text')
      .attr('x', -axisOffset);

    this.svg
      .append('g')
      .attr('class', 'bx--axis bx--axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('y', axisOffset)
      .style('text-anchor', 'end')
      .attr('transform', `rotate(-65)`);
  }

  renderLabels() {
    const { labelOffset, xAxisLabel, yAxisLabel, height, width } = this.state;

    const yLabel = this.svg
      .select('.bx--axis--y')
      .append('text')
      .text(`${yAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr(
        'transform',
        `translate(${-labelOffset}, ${height / 2}) rotate(-90)`
      );

    const xLabel = this.svg
      .select('.bx--axis--x')
      .append('text')
      .text(`${xAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr('transform', `translate(${width / 2}, ${labelOffset})`);
  }

  renderPoints() {
    const { data } = this.state;

    this.svg
      .append('g')
      .attr('class', 'scatter-container')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', d => this.x(d[1]))
      .attr('cy', d => this.y(d[0]))
      .attr('fill', '#00a68f')
      .attr('r', 0)
      .transition()
      .delay((d, i) => i * 35)
      .attr('r', 4);
  }

  renderOverlay() {
    const { width, height, data } = this.state;

    const overlay = this.svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'overlay')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', () => {
        this.onMouseMove(data);
      });
  }

  onMouseMove(data) {
    const { margin } = this.state;
    const bisectDate = d3.bisector(function(d) {
      return d[1];
    }).right;

    const mouse = d3.mouse(this.refs.container)[0] - margin.left;
    const timestamp = this.x.invert(mouse);
    const index = bisectDate(data, timestamp);
    const d0 = data[index - 1];
    const d1 = data[index];
    const d = timestamp - d0[1] > d1[1] - timestamp ? d1 : d0;

    this.props.onHover(d);
  }

  render() {
    return <svg ref="container" />;
  }
}

ScatterPlot.propTypes = propTypes;
ScatterPlot.defaultProps = defaultProps;

export default ScatterPlot;
