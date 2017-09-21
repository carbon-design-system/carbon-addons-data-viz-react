import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import * as d3 from 'd3';

const propTypes = {
  data: PropTypes.array,
  height: PropTypes.number,
  width: PropTypes.number,
  margin: PropTypes.object,
  labelOffsetX: PropTypes.number,
  labelOffsetY: PropTypes.number,
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
  labelOffsetX: 65,
  labelOffsetY: 55,
  axisOffset: 16,
  timeFormat: '%I:%M:%S',
  xAxisLabel: 'X Axis',
  yAxisLabel: 'Y Axis',
};

class LineGraph extends Component {
  state = {
    data: this.props.data,
    height: this.props.height,
    width: this.props.width,
    margin: this.props.margin,
    labelOffsetX: this.props.labelOffsetX,
    labelOffsetY: this.props.labelOffsetY,
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

    this.x = d3
      .scaleTime()
      .range([0, width])
      .domain(d3.extent(data, d => d[1]));

    this.y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d[0])]);

    this.renderAxes();
    this.renderLabels();
    this.renderLine();
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

    this.svg.selectAll('.bx--axis--y path').style('display', 'none');
    this.svg.selectAll('.bx--axis path').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick line').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick text').attr('fill', '#5A6872');
  }

  renderLabels() {
    const {
      labelOffsetY,
      labelOffsetX,
      xAxisLabel,
      yAxisLabel,
      height,
      width,
    } = this.state;

    const yLabel = this.svg
      .select('.bx--axis--y')
      .append('text')
      .text(`${yAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr(
        'transform',
        `translate(${-labelOffsetY}, ${height / 2}) rotate(-90)`
      );

    const xLabel = this.svg
      .select('.bx--axis--x')
      .append('text')
      .text(`${xAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr('transform', `translate(${width / 2}, ${labelOffsetX})`);

    this.svg
      .selectAll('.bx--graph-label')
      .attr('font-size', '10')
      .attr('font-weight', '700')
      .attr('fill', '#5A6872')
      .attr('text-anchor', 'middle');
  }

  renderLine() {
    const { data } = this.state;
    const line = d3.line().x(d => this.x(d[1])).y(d => this.y(d[0]));

    const path = this.svg
      .append('g')
      .datum(data)
      .append('path')
      .attr('class', 'bx--line')
      .attr('stroke', '#00a69f')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('pointer-events', 'none')
      .attr('d', line);

    var totalLength = path.node().getTotalLength();

    path
      .attr('stroke-dasharray', 0 + ' ' + totalLength)
      .transition()
      .ease(d3.easeSin)
      .duration(1000)
      .attr('stroke-dasharray', totalLength + ' ' + 0);
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
    this.props.onHover(d, d3.event.pageX, d3.event.pageY);
  }

  render() {
    return <svg ref="container" />;
  }
}

LineGraph.propTypes = propTypes;
LineGraph.defaultProps = defaultProps;

export default LineGraph;
