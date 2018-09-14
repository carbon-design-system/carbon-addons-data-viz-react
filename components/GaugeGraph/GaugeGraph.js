import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as d3 from 'd3';

const propTypes = {
  radius: PropTypes.number,
  padding: PropTypes.number,
  amount: PropTypes.number,
  total: PropTypes.number,
  size: PropTypes.string,
  gaugePercentages: PropTypes.array,
  id: PropTypes.string,
  tooltipId: PropTypes.string,
  tau: PropTypes.number,
  labelText: PropTypes.string,
  valueText: PropTypes.string,
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
  fillColor: '#00a68f',
  gaugePercentages: [
    { low: 0, high: 50, color: '#4B8400' },
    { low: 50, high: 75, color: '#EFC100' },
    { low: 75, high: 100, color: '#FF5050' },
  ],
  id: 'gauge-container',
  tooltipId: 'tooltip-container',
};

class GaugeGraph extends Component {
  state = {
    boxSize: 0,
    ratio: 0,
  };

  componentDidMount() {
    const { radius, padding, amount, total } = this.props;

    this.setState(() => {
      return {
        boxSize: (radius + padding) * 2,
        ratio: amount / total,
      };
    }, this.initialRender);
  }

  initialRender() {
    const { boxSize } = this.state;
    const { size, padding, id } = this.props;

    this.svg = d3
      .select(`#${id}`)
      .attr('width', boxSize)
      .attr('height', size === 'half' ? boxSize / 2 + padding : boxSize)
      .append('g')
      .attr('transform', `translate(${boxSize / 2}, ${boxSize / 2})`);

    this.renderSVG();
    this.renderLabels();
  }

  renderSVG() {
    const { tau, radius, size, gaugePercentages, id, fillColor } = this.props;
    const { ratio } = this.state;

    // Transition function
    const arcTween = function(newAngle) {
      return function(d) {
        let interpolate;
        if (size === 'half') {
          interpolate = d3.interpolate(d.endAngle, Math.PI * (newAngle / tau));

          const line = d3.select(`#${id} .bx--gauge-line`);
          const percent = (newAngle / tau) * 100;

          line.style('fill', () => {
            let color;
            gaugePercentages.forEach(range => {
              if (percent >= range.low && percent <= range.high) {
                color = range.color;
              }
            });

            return color;
          });
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

    this.svg
      .append('path')
      .datum({ endAngle: size === 'half' ? Math.PI : tau })
      .style('fill', '#dfe3e6')
      .attr('d', arc)
      .attr('transform', `${size === 'half' ? 'rotate(-90)' : ''}`);

    this.svg
      .append('path')
      .datum({ endAngle: 0 })
      .style('fill', fillColor)
      .attr('transform', `${size === 'half' ? 'rotate(-90)' : ''}`)
      .attr('class', 'bx--gauge-line')
      .transition()
      .duration(1000)
      .delay(1000)
      .attrTween('d', arcTween(ratio * tau));
  }

  renderLabels() {
    const { valueText, labelText, tooltipId } = this.props;

    d3.select(`#${tooltipId} .bx--gauge-amount`)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay(1500)
      .style('opacity', 1)
      .text(`${valueText}`);

    d3.select(`#${tooltipId} .bx--gauge-total`)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay(1700)
      .style('opacity', 1)
      .text(`${labelText}`);
  }

  render() {
    const { size, tooltipId, id } = this.props;
    const tooltipStyles = {
      position: 'absolute',
      top: `${size === 'half' ? '60%' : '50%'}`,
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };

    const amountStyles = {
      textAlign: 'center',
      fontSize: '30px',
      fontWeight: '600',
      lineHeight: '1',
      margin: '0',
      marginBottom: '.25rem',
    };

    const totalStyles = {
      fontSize: '14px',
      margin: '0',
      lineHeight: '1',
      whiteSpace: 'nowrap',
    };

    return (
      <div
        className="bx--graph-container"
        style={{ position: 'relative', width: this.state.boxSize }}>
        <svg id={id} />
        <div className="bx--gauge-tooltip" id={tooltipId} style={tooltipStyles}>
          <p className="bx--gauge-amount" style={amountStyles}>
            Place
          </p>
          <p className="bx--gauge-total" style={totalStyles}>
            Holder
          </p>
        </div>
      </div>
    );
  }
}

GaugeGraph.propTypes = propTypes;
GaugeGraph.defaultProps = defaultProps;

export default GaugeGraph;
