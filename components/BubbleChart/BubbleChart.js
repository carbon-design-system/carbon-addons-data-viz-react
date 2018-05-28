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
  color: ['#00A78F', '#3b1a40', '#473793', '#3c6df0', '#56D2BB'],
  margin: {
    top: 30,
    right: 20,
    bottom: 70,
    left: 65,
  },
  labelOffset: 55,
  axisOffset: 16,
  xAxisLabel: 'X Axis',
  yAxisLabel: 'Y Axis',
  showTooltip: true,
  onHover: () => {},
  formatValue: null,
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
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    this.width = width - (margin.left + margin.right);
    this.height = height - (margin.top + margin.bottom);
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
      this.xScale.domain(d3.extent(nextProps.data, d => d[0]).reverse());
      this.xAxis.scale(this.xScale);
      this.updateEmptyState(nextProps.data);
      this.updateData(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  resize(height, width) {
    const { margin, containerId } = this.props;

    this.svg.remove();

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

  initialRender() {
    const { data, formatValue } = this.props;

    this.updateEmptyState(data);

    this.xScale = d3
      .scaleLinear()
      .range([0, this.width])
      .domain(d3.extent(data, d => d[0]).reverse());

    this.xAxis = d3
      .axisBottom()
      .ticks(4)
      .tickSize(-this.height)
      .scale(this.xScale);

    if (formatValue !== null && typeof formatValue === 'function') {
      this.xAxis.tickFormat(formatValue);
    }

    this.renderAxes();
    this.renderLabels();

    if (this.xScale) {
      this.renderPoints();
    }
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

    this.xAxis.scale(this.xScale);

    this.svg.select('.bx--axis--x .bx--graph-label').text(xAxisLabel);

    this.updateStyles();
  }

  renderAxes() {
    const { axisOffset } = this.props;

    this.svg
      .append('g')
      .attr('class', 'bx--axis bx--axis--x')
      .attr('transform', `translate(0, ${this.height})`)
      .call(this.xAxis)
      .attr('stroke-dasharray', '4')
      .selectAll('text')
      .attr('y', axisOffset)
      .style('text-anchor', 'middle');

    this.updateStyles();
  }

  updateStyles() {
    this.svg.selectAll('.bx--axis path').style('display', 'none');
    this.svg.selectAll('.tick line').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick text').attr('fill', '#5A6872');
  }

  renderLabels() {
    const { labelOffset, xAxisLabel } = this.props;

    this.svg
      .select('.bx--axis--x')
      .append('text')
      .text(`${xAxisLabel}`)
      .attr('class', 'bx--graph-label')
      .attr('transform', `translate(${this.width / 2}, ${labelOffset})`);

    this.svg
      .selectAll('.bx--graph-label')
      .attr('font-size', '10')
      .attr('font-weight', '700')
      .attr('fill', '#5A6872')
      .attr('text-anchor', 'middle');
  }

  renderPoints() {
    const { data } = this.props;
    const valuesMap = data.map(d => d[0]);
    const valueTotals = d3.sum(valuesMap);

    this.svg
      .append('g')
      .attr('class', 'bubble-container')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('data-point', (d, i) => i)
      .attr('cx', d => this.xScale(d[0]))
      .attr('cy', this.height / 2)
      .attr('fill', (d, i) => this.color(i))
      .attr('r', 0)
      .transition()
      .duration(350)
      .delay((d, i) => i * 40)
      .attr('r', d =>
        d3.min([this.height * 0.7, Math.max(d[0] / valueTotals * 100, 5)])
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
        label: d.itemLabel,
      };
    } else {
      mouseData = {
        data: [d[0][0] || d[0]],
        index: i,
        label: d[1],
      };
    }

    return mouseData;
  }

  onMouseEnter(d, i) {
    const { showTooltip, formatTooltipData, margin } = this.props;
    const mouseData = this.getMouseData(d, i);

    let circle = this.svg.select(`circle[data-point="${mouseData.index}"]`);
    circle
      .transition()
      .duration(250)
      .attr('fill', () => d3.color(circle.attr('fill')).darker());

    this.props.onHover(mouseData);

    if (showTooltip) {
      const tooltipData = formatTooltipData(
        Object.assign(mouseData, { circle })
      );

      ReactDOM.render(<DataTooltip data={tooltipData} />, this.tooltipId);
      const tooltipSize = d3
        .select(this.tooltipId.children[0])
        .node()
        .getBoundingClientRect();

      const offsetY = tooltipSize.height + 5;
      const offsetX = tooltipSize.width / 2;
      const circleRadius = parseInt(circle.attr('r'), 10);
      const leftPos = this.xScale(mouseData.data[0]) + margin.left - offsetX;
      const topPos = -this.height / 2 - margin.bottom - circleRadius - offsetY;

      d3
        .select(this.tooltipId)
        .style('position', 'relative')
        .style('z-index', 1)
        .style('left', `${leftPos}px`)
        .style('top', `${topPos}px`);
    }
  }

  onMouseOut(d, i) {
    const mouseData = this.getMouseData(d, i);

    let circle = this.svg.select(`circle[data-point="${mouseData.index}"]`);

    circle
      .transition()
      .duration(250)
      .attr('fill', () => this.color(mouseData.index));

    // ReactDOM.unmountComponentAtNode(this.tooltipId);
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
        <div
          className="bx--graph-tooltip"
          id="tooltip-div"
          ref={id => (this.tooltipId = id)}
        />
      </div>
    );
  }
}

BubbleChart.propTypes = propTypes;
BubbleChart.defaultProps = defaultProps;

export default BubbleChart;
