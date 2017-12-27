import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import * as d3 from 'd3';

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
  isUTC: PropTypes.bool,
  color: PropTypes.array,
  drawLine: PropTypes.bool,
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
  emptyText: 'There is currently no data available for the parameters selected. Please try a different combination.',
  isUTC: false,
  color: ['#00a68f', '#3b1a40', '#473793', '#3c6df0', '#56D2BB'],
  drawLine: true,
};

class LineGraph extends Component {
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

    if (data.length > 0) {
      this.totalLines = data[0].length - 1;
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

    this.width = width - (margin.left + margin.right);
    this.height = height - (margin.top + margin.bottom);

    this.initialRender();
  }

  componentWillUpdate(nextProps) {
    if (this.x) {
      this.x.domain(d3.extent(nextProps.data, d => d[d.length - 1]));
      this.y.domain([
        0,
        d3.max(nextProps.data, d => d3.max(d.slice(0, d.length - 1))),
      ]);

      this.updateEmptyState(nextProps.data);
      this.updateData(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
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

  updateData(nextProps) {
    const { data, axisOffset, xAxisLabel, yAxisLabel } = nextProps;

    for (var i = 0; i < this.totalLines; i++) {
      this.svg.selectAll(`g[data-line="${i}"]`).remove();
    }

    if (data.length > 0) {
      this.totalLines = data[0].length - 1;
    }

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
      .style('text-anchor', 'end')
      .attr('transform', `rotate(-65)`);

    this.svg.select('.bx--axis--x .bx--graph-label').text(xAxisLabel);

    this.updateStyles();
  }

  updateStyles() {
    this.svg.selectAll('.bx--axis--y path').style('display', 'none');
    this.svg.selectAll('.bx--axis path').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick line').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick text').attr('fill', '#5A6872');
  }

  initialRender() {
    const { data, timeFormat, xScale, isUTC } = this.props;

    this.updateEmptyState(data);

    if (isUTC) {
      this.x = d3
        .scaleUtc()
        .range([0, this.width])
        .domain(d3.extent(data, d => d[d.length - 1]));
    } else {
      this.x = d3
        .scaleTime()
        .range([0, this.width])
        .domain(d3.extent(data, d => d[d.length - 1]));
    }

    this.y = d3
      .scaleLinear()
      .range([this.height, 0])
      .domain([0, d3.max(data, d => d3.max(d.slice(0, d.length - 1)))]);

    this.line = d3
      .line()
      .x(d => this.x(d[d.length - 1]))
      .y(d => {
        return this.y(d[this.count]);
      })
      .defined(d => {
        return !isNaN(d[this.count]);
      });

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
    this.renderOverlay();

    if (this.x) {
      this.renderLine();
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
      .style('text-anchor', 'end')
      .attr('transform', `rotate(-65)`);

    this.updateStyles();
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

  renderLine() {
    const { data, drawLine } = this.props;
    const color = d3.scaleOrdinal(this.props.color);

    this.count = 0;
    if (data.length > 0) {
      for (let i = 0; i < data[0].length - 1; i++) {
        const path = this.svg
          .append('g')
          .attr('data-line', i)
          .datum(data)
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

        this.count++;
      }
    }
  }

  renderOverlay() {
    const { data } = this.props;

    const overlay = this.svg
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

  onMouseOut() {
    if (this.props.data.length > 2) {
      this.props.onMouseOut();
    }
  }

  onMouseMove() {
    const { margin, id, data } = this.props;
    const bisectDate = d3.bisector(function(d) {
      return d[d.length - 1];
    }).right;

    if (data.length > 2) {
      const mouse = d3.mouse(this.id)[0] - margin.left;
      const timestamp = this.x.invert(mouse);
      const index = bisectDate(data, timestamp);
      const d0 = data[index - 1];
      const d1 = data[index];

      let d, mouseData;
      if (d0 && d1) {
        d = timestamp - d0[d0.length - 1] > d1[d1.length - 1] - timestamp
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
      }

      this.props.onHover(mouseData);
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
        style={{ position: 'relative' }}
      >
        <p className="bx--line-graph-empty-text" />
        <svg id={id} ref={id => this.id = id} />
      </div>
    );
  }
}

LineGraph.propTypes = propTypes;
LineGraph.defaultProps = defaultProps;

export default LineGraph;
