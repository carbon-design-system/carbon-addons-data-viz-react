import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import DataTooltip from '../DataTooltip/DataTooltip';
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
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  onHover: PropTypes.func,
  onMouseOut: PropTypes.func,
  emptyText: PropTypes.string,
  color: PropTypes.array,
  showTooltip: PropTypes.bool,
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
  labelOffsetX: 45,
  labelOffsetY: 55,
  axisOffset: 16,
  xAxisLabel: 'X Axis',
  yAxisLabel: 'Y Axis',
  onHover: () => {},
  timeFormat: null,
  formatValue: null,
  formatTooltipData: ({ data, seriesLabels, label, index, rect }) => {
    return [
      {
        data: data[0],
        label: seriesLabels ? seriesLabels[index] : label,
        color: rect.attr('fill'),
      },
    ];
  },
  emptyText:
    'There is currently no data available for the parameters selected. Please try a different combination.',
  color: ['#00A78F', '#3b1a40', '#473793', '#3c6df0', '#56D2BB'],
  showTooltip: true,
};

class NegativeBarGraph extends Component {
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
    if (this.yScale) {
      this.yScale.domain(nextProps.data.map(d => d[1]));

      if (this.isGrouped) {
        const dataLength = nextProps.data[0][0].length;
        this.yScale1
          .rangeRound([this.yScale.bandwidth(), 0])
          .domain(d3.range(dataLength));
        this.xScale.domain(
          d3.extent(
            nextProps.data.reduce((acc, item) => acc.concat(item[0]), [])
          )
        );
      } else {
        this.xScale.domain(d3.extent(nextProps.data.map(d => d[0][0])));
      }

      this.xAxis.scale(this.xScale.nice());

      this.updateEmptyState(nextProps.data);
      this.updateData(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  initialRender() {
    const { data, timeFormat, formatValue } = this.props;

    this.updateEmptyState(data);

    const dataLength = data[0][0].length;
    this.isGrouped = dataLength > 1;

    this.yScale = d3
      .scaleBand()
      .range([this.height, 0])
      .domain(data.map(d => d[1]))
      .padding(0.3);

    if (this.isGrouped) {
      this.yScale1 = d3
        .scaleBand()
        .rangeRound([this.yScale.bandwidth(), 0])
        .domain(d3.range(dataLength))
        .padding(0.1);
      this.xScale = d3
        .scaleLinear()
        .range([0, this.width])
        .domain(d3.extent(data.reduce((acc, item) => acc.concat(item[0]), [])));
    } else {
      this.xScale = d3
        .scaleLinear()
        .range([0, this.width])
        .domain(d3.extent(data.map(d => d[0][0])));
    }

    this.xAxis = d3
      .axisBottom()
      .ticks(5)
      .tickSize(-this.height)
      .scale(this.xScale.nice());

    if (formatValue !== null) {
      this.xAxis.tickFormat(formatValue);
    }

    this.yAxis = d3
      .axisLeft()
      .scale(this.yScale)
      .tickSize(0);

    if (timeFormat !== null) {
      this.yAxis.tickFormat(d3.timeFormat(timeFormat));
    }

    this.renderAxes();
    this.renderLabels();

    if (this.xScale) {
      this.renderBars();
    }
  }

  renderAxes() {
    const { axisOffset } = this.props;

    this.svg
      .append('g')
      .attr('class', 'bx--axis bx--axis--y')
      .call(this.yAxis)
      .selectAll('text')
      .attr('x', -axisOffset);

    this.svg
      .append('g')
      .attr('class', 'bx--axis bx--axis--x')
      .attr('transform', `translate(0, ${this.height})`)
      .call(this.xAxis)
      .attr('stroke-dasharray', 4)
      .selectAll('text')
      .attr('y', axisOffset)
      .style('text-anchor', 'middle');

    this.svg
      .select('.bx--axis--x')
      .append('line')
      .attr('class', 'center-line')
      .attr('x1', () => this.xScale(0))
      .attr('x2', () => this.xScale(0))
      .attr('y1', -this.height)
      .attr('y2', 0)
      .attr('stroke', '#3a403d')
      .attr('stroke-dasharray', 0)
      .attr('stroke-width', '2px');

    this.updateStyles();
  }

  renderBars() {
    const { data, color } = this.props;

    const barContainer = this.svg.append('g').attr('class', 'bar-container');

    if (data.length > 1) {
      if (this.isGrouped) {
        this.count = 0;
        barContainer
          .selectAll('g')
          .data(data)
          .enter()
          .append('g')
          .attr('transform', d => `translate(0, ${this.yScale(d[1])})`)
          .selectAll('rect')
          .data(d => {
            this.count++;
            let itemLabel = d[1];
            return d[0].map((key, index) => {
              return {
                key,
                index,
                group: this.count - 1,
                itemLabel,
              };
            });
          })
          .enter()
          .append('rect')
          .attr('class', d => {
            const val = d.key;
            const directionClass = val < 0 ? 'bar--negative' : 'bar--positive';
            return `bar ${directionClass}`;
          })
          .attr('height', this.yScale1.bandwidth())
          .attr('width', 0)
          .attr('x', () => this.xScale(0))
          .attr('y', d => this.yScale1(d.index))
          .attr('fill', d => {
            const p = d.key < 0 ? 1 : 0;
            return d3.color(this.color(d.index)).darker(p);
          })
          .attr('data-bar', d => `${d.index}-${d.group}`)
          .transition()
          .duration(500)
          .delay((d, i) => i * 50)
          .attr('x', d => (d.key < 0 ? this.xScale(d.key) : this.xScale(0)))
          .attr('width', d => {
            const value = d.key;
            return value > 0
              ? this.xScale(value) - this.xScale(0)
              : this.xScale(value * -1) - this.xScale(0);
          });
      } else {
        barContainer
          .selectAll('rect')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', d => {
            const val = d[0][0];
            const directionClass = val < 0 ? 'bar--negative' : 'bar--positive';
            return `bar ${directionClass}`;
          })
          .attr('x', () => this.xScale(0))
          .attr('width', 0)
          .attr('y', d => this.yScale(d[1]))
          .attr('height', this.yScale.bandwidth())
          .attr('data-bar', (d, i) => `${i}-0`)
          .attr(
            'fill',
            (d, i) =>
              d[0][0] > 0
                ? this.color(i % color.length)
                : d3.color(this.color(i % color.length)).darker(1)
          )
          .transition()
          .duration(750)
          .delay((d, i) => i * 50)
          .attr(
            'x',
            d => (d[0][0] < 0 ? this.xScale(d[0][0]) - 1 : this.xScale(0) + 1)
          )
          .attr('width', d => {
            const value = d[0][0];
            return d[0][0] > 0
              ? this.xScale(value) - this.xScale(0)
              : this.xScale(value * -1) - this.xScale(0);
          });
      }

      barContainer
        .selectAll('rect')
        .on('mouseover', (d, i) => this.onMouseEnter(d, i))
        .on('mouseout', (d, i) => this.onMouseOut(d, i));
    }
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
        data: [d[0][0]] || [d[0]],
        index: i,
        group: 0,
        label: d[1],
      };
    }

    return mouseData;
  }

  onMouseEnter(d, i) {
    const {
      timeFormat,
      showTooltip,
      margin,
      labelOffsetX,
      seriesLabels,
    } = this.props;
    const mouseData = this.getMouseData(d, i);
    const p = mouseData.data[0] < 0 ? -1 : 1;
    let rect = this.svg.select(
      `rect[data-bar="${mouseData.index}-${mouseData.group}"]`
    );
    rect
      .transition()
      .duration(150)
      .attr('fill', d3.color(rect.attr('fill')).darker(p));

    const yVal = mouseData.label;

    if (timeFormat) {
      const format = d3.timeFormat(timeFormat);
      mouseData.label = format(mouseData.label);
    }

    this.props.onHover(mouseData);

    const tooltipData = this.props.formatTooltipData(
      Object.assign(mouseData, {
        rect,
        seriesLabels,
      })
    );

    if (showTooltip) {
      ReactDOM.render(<DataTooltip data={tooltipData} />, this.tooltipId);
      const tooltipSize = d3
        .select(this.tooltipId.children[0])
        .node()
        .getBoundingClientRect();
      const offsetY = tooltipSize.height / 2.5;
      const offsetX = tooltipSize.width / 2;
      const barWidth = parseFloat(mouseData.rect.attr('width'));
      const multiplicator = mouseData.data[0] < 0 ? -1 : 1;
      const leftPos =
        this.xScale(0) + labelOffsetX - offsetX + barWidth * multiplicator / 2;
      const topPos =
        -this.height -
        margin.top -
        margin.bottom -
        offsetY +
        this.yScale(yVal) +
        (this.yScale1 ? this.yScale1(mouseData.index) : 0) -
        (this.yScale1
          ? this.yScale1.bandwidth() / 2
          : this.yScale.bandwidth() / 2);

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

    let rect = this.svg.select(
      `rect[data-bar="${mouseData.index}-${mouseData.group}"]`
    );

    const darken = (c, p) => {
      return d3.color(c).darker(p);
    };

    rect
      .transition()
      .duration(500)
      .attr('fill', () => {
        const p = mouseData.data[0] < 0 ? 1 : 0;
        return this.isGrouped
          ? darken(this.color(mouseData.index), p)
          : darken(this.color(mouseData.index % this.props.color.length), p);
      });
    ReactDOM.unmountComponentAtNode(this.tooltipId);
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
    const { axisOffset, xAxisLabel, yAxisLabel } = nextProps;

    this.svg.selectAll('g.bar-container').remove();

    this.svg
      .select('.center-line')
      .transition()
      .attr('x1', () => this.xScale(0))
      .attr('x2', () => this.xScale(0))
      .attr('y1', -this.height)
      .attr('y2', 0);

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
      .selectAll('text')
      .attr('y', axisOffset)
      .style('text-anchor', 'middle');

    this.svg.select('.bx--axis--x .bx--graph-label').text(xAxisLabel);

    this.updateStyles();
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

  updateStyles() {
    this.svg.selectAll('.bx--axis--x path').style('display', 'none');
    this.svg.selectAll('.bx--axis--y path').style('display', 'none');
    this.svg.selectAll('.bx--axis path').attr('stroke', '#5A6872');
    this.svg.selectAll('.bx--axis path').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick line').attr('stroke', '#5A6872');
    this.svg.selectAll('.tick text').attr('fill', '#5A6872');
  }

  render() {
    const { id, containerId } = this.props;

    if (this.xScale) {
      this.renderBars();
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

NegativeBarGraph.propTypes = propTypes;
NegativeBarGraph.defaultProps = defaultProps;

export default NegativeBarGraph;
