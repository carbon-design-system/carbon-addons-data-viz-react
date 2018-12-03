import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

const propTypes = {
  data: PropTypes.array,
  radius: PropTypes.number,
  formatFunction: PropTypes.func,
  id: PropTypes.string,
  color: PropTypes.array,
  onHover: PropTypes.func,
};

const defaultProps = {
  data: [['Gryffindor', 100]],
  radius: 96,
  formatFunction: value => value,
  color: ['#00a68f', '#3b1a40', '#473793', '#3c6df0', '#56D2BB'],
  id: 'graph-container',
};

class PieChart extends Component {
  componentDidMount() {
    this.width = this.props.radius * 2;
    this.height = this.props.radius * 2 + 24;

    this.renderSVG();
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  renderSVG() {
    const { data, radius, formatFunction, id, onHover } = this.props;
    const color = d3.scaleOrdinal(this.props.color);

    this.svg = d3
      .select(this.svgNode)
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('class', 'group-container')
      .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

    const pie = d3
      .pie()
      .sort(null)
      .value(d => d[1]);
    const path = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 40);
    const pathTwo = d3
      .arc()
      .outerRadius(radius)
      .innerRadius(radius - 40);

    const arc = this.svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    const arcs = arc
      .append('path')
      .attr('fill', (d, i) => color(i))
      .attr('stroke-width', 2)
      .attr('stroke', '#FFFFFF')
      .attr('d', path);

    arcs
      .on('mouseover', function(d) {
        d3.select(this)
          .transition()
          .style('cursor', 'pointer')
          .attr('d', pathTwo);

        d3.select(`#${id} .bx--pie-tooltip`).style('display', 'inherit');
        d3.select(`#${id} .bx--pie-key`).text(`${d.data[0]}`);
        d3.select(`#${id} .bx--pie-value`).text(`${formatFunction(d.data[1])}`);
        if (onHover) {
          onHover(true, d.data[0]);
        }
      })
      .on('mouseout', function() {
        d3.select(`#${id} .bx--pie-tooltip`).style('display', 'none');
        d3.select(this)
          .transition()
          .attr('d', path);
        if (onHover) {
          onHover(false);
        }
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
      </div>
    );
  }
}

PieChart.propTypes = propTypes;
PieChart.defaultProps = defaultProps;

export default PieChart;
