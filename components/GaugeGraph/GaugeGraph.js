import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import * as d3 from 'd3';

const propTypes = {
  radius: PropTypes.number,
  padding: PropTypes.number,
  amount: PropTypes.number,
  total: PropTypes.number,
};

const defaultProps = {
  tau: 2 * Math.PI,
  radius: 80,
  padding: 30,
  amount: 75,
  total: 100,
};

class GaugeGraph extends Component {
  state = {
    tau: this.props.tau,
    radius: this.props.radius,
    padding: this.props.padding,
    amount: this.props.amount,
    total: this.props.total,
  };

  componentDidMount() {
    const { radius, padding, amount, total } = this.state;

    this.setState(() => {
      return {
        boxSize: (radius + padding) * 2,
        ratio: amount / total,
      };
    }, this.initialRender);
  }

  initialRender() {
    this.renderSVG();
  }

  renderSVG() {
    const { tau, radius, padding, boxSize, ratio } = this.state;

    // Transition function
    const arcTween = function(newAngle) {
      return function(d) {
        const interpolate = d3.interpolate(d.endAngle, newAngle);

        return function(t) {
          d.endAngle = interpolate(t);

          return arc(d);
        };
      };
    };

    const arc = d3
      .arc()
      .innerRadius(radius)
      .outerRadius(radius - 10)
      .startAngle(0);

    this.svg = d3
      .select(this.refs.container)
      .attr('width', boxSize)
      .attr('height', boxSize)
      .append('g')
      .attr('transform', `translate(${boxSize / 2}, ${boxSize / 2})`);

    this.svg
      .append('path')
      .datum({ endAngle: tau })
      .style('fill', '#dfe3e6')
      .attr('d', arc);

    this.svg
      .append('path')
      .datum({ endAngle: 0 })
      .style('fill', '#FE8500')
      .transition()
      .duration(1000)
      .delay(1000)
      .attrTween('d', arcTween(ratio * tau));
  }

  render() {
    return <svg ref="container" />;
  }
}

GaugeGraph.propTypes = propTypes;
GaugeGraph.defaultProps = defaultProps;

export default GaugeGraph;
