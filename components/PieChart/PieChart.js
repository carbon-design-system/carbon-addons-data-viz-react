import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DataTooltip from '../DataTooltip/DataTooltip';
import * as d3 from 'd3';
import _ from 'lodash';
import ReactDOM from 'react-dom';

const propTypes = {
  data: PropTypes.array,
  radius: PropTypes.number,
  formatValue: PropTypes.func,
  formatTooltipData: PropTypes.func,
  id: PropTypes.string,
  color: PropTypes.array,
  onHover: PropTypes.func,
  showTotals: PropTypes.bool,
  showTooltip: PropTypes.bool,
};

const defaultProps = {
  data: [['Gryffindor', 100]],
  radius: 96,
  formatValue: value => value,
  formatTooltipData: ({ data: [label, value], color }) => {
    return [
      {
        data: value,
        label: label,
        color: color,
      },
    ];
  },
  color: ['#00a68f', '#3b1a40', '#473793', '#3c6df0', '#56D2BB'],
  id: 'graph-container',
  showTotals: false,
  showTooltip: true,
};

class PieChart extends Component {
  componentDidMount() {
    this.width = this.props.radius * 2;
    this.height = this.props.radius * 2 + 24;
    this.radius = this.props.radius;
    this.renderSVG();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props, nextProps)) {
      this.renderSVG(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  resize(radius) {
    this.width = radius * 2;
    this.height = radius * 2 + 24;
    this.radius = radius;
    this.svg.remove();

    this.renderSVG();
  }

  renderSVG() {
    const {
      data,
      formatValue,
      formatTooltipData,
      id,
      onHover,
      showTotals,
      showTooltip,
    } = this.props;
    const color = d3.scaleOrdinal(this.props.color);
    const tooltipId = this.tooltipId;
    const pie = d3
      .pie()
      .sort(null)
      .value(d => d[1]);
    const path = d3
      .arc()
      .outerRadius(this.radius - 10)
      .innerRadius(this.radius - 40);
    const pathTwo = d3
      .arc()
      .outerRadius(this.radius)
      .innerRadius(this.radius - 40);

    if (this.svg) {
      const paths = this.svg.selectAll('path');
      if (paths.size()) {
        this.svg.remove();
      }
    }

    this.svg = d3
      .select(this.svgNode)
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('class', 'group-container')
      .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

    const arc = this.svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arc
      .append('path')
      .attr('fill', (d, i) => color(i))
      .attr('stroke-width', 2)
      .attr('stroke', '#FFFFFF')
      .transition()
      .ease(d3.easeQuadOut)
      .duration(650)
      .attrTween('d', d => {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return t => path(i(t));
      });

    const totalAmount = data.reduce((acc, values) => (acc += values[1]), 0);

    if (showTotals) {
      d3.select(`#${id} .bx--pie-tooltip`).style('display', 'block');
      d3.select(`#${id} .bx--pie-key`).text('Total');
      d3.select(`#${id} .bx--pie-value`).text(`${formatValue(totalAmount)}`);
    }

    this.svg
      .selectAll('path')
      .on('mouseover', function(d) {
        d3.select(this)
          .transition()
          .style('cursor', 'pointer')
          .attr('d', pathTwo);

        d3.select(`#${id} .bx--pie-tooltip`).style('display', 'inherit');
        d3.select(`#${id} .bx--pie-key`).text(`${d.data[0]}`);
        d3.select(`#${id} .bx--pie-value`).text(`${formatValue(d.data[1])}`);
        if (onHover) {
          onHover(true, d.data[0]);
        }
        if (showTooltip) {
          const tooltipData = formatTooltipData({
            data: d.data,
            color: color(d.index),
          });

          ReactDOM.render(<DataTooltip data={tooltipData} />, tooltipId);

          const tooltipSize = d3
            .select(tooltipId.children[0])
            .node()
            .getBoundingClientRect();
          const pos = path.centroid(d);
          const leftPos = pos[0] + ((tooltipSize.width / 2) * pos[0]) / 100;
          const topPos = pos[1] + (tooltipSize.height * pos[1]) / 100;
          d3.select(tooltipId)
            .style('position', 'absolute')
            .style('top', `50%`)
            .style('left', `50%`)
            .style('margin-left', `${leftPos}px`)
            .style('margin-top', `${topPos}px`)
            .style('width', `${tooltipSize.width}px`)
            .style('height', `${tooltipSize.height}px`)
            .style('transform', 'translate(-50%, -50%)');
        }
      })
      .on('mouseout', function() {
        d3.select(`#${id} .bx--pie-tooltip`).style(
          'display',
          !showTotals && 'none'
        );
        d3.select(this)
          .transition()
          .attr('d', path);
        if (showTotals) {
          d3.select(`#${id} .bx--pie-tooltip`).style('display', 'block');
          d3.select(`#${id} .bx--pie-key`).text('Total');
          d3.select(`#${id} .bx--pie-value`).text(
            `${formatValue(totalAmount)}`
          );
        }

        if (onHover) {
          onHover(false);
        }
        ReactDOM.unmountComponentAtNode(tooltipId);
      });
  }

  render() {
    const { id } = this.props;
    const tooltipStyles = {
      display: 'none',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };

    const keyStyles = {
      fontSize: '14px',
      fontWeight: '400',
      textAlign: 'center',
      color: '#5A6872',
    };

    const valueStyles = {
      fontSize: '29px',
      fontWeight: '300',
      textAlign: 'center',
      lineHeight: '1',
    };

    this.renderSVG();

    return (
      <div
        className="bx--graph-container"
        id={id}
        style={{
          position: 'relative',
          width: this.width,
          height: this.height,
        }}>
        <svg ref={node => (this.svgNode = node)} />
        <div className="bx--pie-tooltip" style={tooltipStyles}>
          <p className="bx--pie-value" style={valueStyles} />
          <p className="bx--pie-key" style={keyStyles} />
        </div>
        <div
          className="bx--graph-tooltip"
          id="tooltip-div"
          ref={id => (this.tooltipId = id)}
        />
      </div>
    );
  }
}

PieChart.propTypes = propTypes;
PieChart.defaultProps = defaultProps;

export default PieChart;
