import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import * as d3 from 'd3';

const propTypes = {
  radius: PropTypes.number,
  padding: PropTypes.number,
  amount: PropTypes.number,
  total: PropTypes.number,
  size: PropTypes.string,
  gaugePercentages: PropTypes.array,
};

const defaultProps = {
  tau: 2 * Math.PI,
  radius: 80,
  padding: 30,
  amount: 75,
  total: 100,
  valueText: '75%',
  labelText: '75 out of 100GB',
  size: 'full',
  gaugePercentages: [50, 75],
};

class GaugeGraph extends Component {
  state = {
    tau: this.props.tau,
    radius: this.props.radius,
    padding: this.props.padding,
    amount: this.props.amount,
    total: this.props.total,
    valueText: this.props.valueText,
    labelText: this.props.labelText,
    size: this.props.size,
    gaugePercentages: this.props.gaugePercentages,
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
    this.renderLabels();
  }

  renderSVG() {
    const {
      tau,
      radius,
      padding,
      boxSize,
      ratio,
      size,
      gaugePercentages,
    } = this.state;

    // Transition function
    const arcTween = function(newAngle) {
      return function(d) {
        let interpolate;
        if (size === 'half') {
          interpolate = d3.interpolate(d.endAngle, Math.PI * (newAngle / tau));

          const line = d3.select('.bx--gauge-line');
          const percent = newAngle / tau * 100;

          line.style('fill', d => {
            if (percent <= gaugePercentages[0]) {
              return '#4B8400';
            } else if (
              percent >= gaugePercentages[0] && percent <= gaugePercentages[1]
            ) {
              return '#EFC100';
            } else {
              return '#FF5050';
            }
          });
          console.log(percent);
        } else {
          interpolate = d3.interpolate(d.endAngle, newAngle);
        }

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
      .datum({ endAngle: size === 'half' ? Math.PI : tau })
      .style('fill', '#dfe3e6')
      .attr('d', arc)
      .attr('transform', `${size === 'half' ? 'rotate(-90)' : ''}`);

    this.svg
      .append('path')
      .datum({ endAngle: 0 })
      .style('fill', '#FE8500')
      .attr('transform', `${size === 'half' ? 'rotate(-90)' : ''}`)
      .attr('class', 'bx--gauge-line')
      .transition()
      .duration(1000)
      .delay(1000)
      .attrTween('d', arcTween(ratio * tau));
  }

  renderLabels() {
    const { valueText, labelText } = this.state;

    d3
      .select('.bx--gauge-amount')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay(1500)
      .style('opacity', 1)
      .text(`${valueText}`);

    d3
      .select('.bx--gauge-total')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay(1700)
      .style('opacity', 1)
      .text(`${labelText}`);
  }

  render() {
    const { size } = this.state;
    const tooltipStyles = {
      position: 'absolute',
      top: `${size === 'half' ? '40%' : '50%'}`,
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };

    const amountStyles = {
      textAlign: 'center',
      fontSize: '30px',
      fontWeight: '600',
      margin: '0',
    };

    const totalStyles = {
      fontSize: '14px',
      margin: '0',
    };

    return (
      <div className="bx--graph-container" style={{ position: 'relative' }}>
        <svg ref="container" />
        <div className="bx--gauge-tooltip" style={tooltipStyles}>
          <p className="bx--gauge-amount" style={amountStyles}>Place</p>
          <p className="bx--gauge-total" style={totalStyles}>Holder</p>
        </div>
      </div>
    );
  }
}

GaugeGraph.propTypes = propTypes;
GaugeGraph.defaultProps = defaultProps;

export default GaugeGraph;
