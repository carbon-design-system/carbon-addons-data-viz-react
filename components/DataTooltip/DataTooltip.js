import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

const propTypes = {
  className: PropTypes.string,
  data: PropTypes.array,
  direction: PropTypes.string,
  id: PropTypes.string,
  heading: PropTypes.string,
  isActive: PropTypes.bool,
};

const defaultProps = {
  data: [100],
  direction: 'top',
  id: 'bx--data-tooltip',
  heading: null,
  isActive: true,
};

class DataTooltip extends Component {
  componentDidMount() {}

  // shouldComponentUpdate(nextProps) {
  //   return this.props.isActive !== nextProps.isActive;
  // }

  componentWillReceiveProps() {}

  // shouldComponentUpdate(nextProps) {}
  componentWillUpdate() {}

  renderTooltipData() {
    const { data } = this.props;
    const items = data.map(item => {
      let divStyle;
      if (item.color) {
        if (data.length <= 1) {
          divStyle = {
            borderTop: `4px solid ${item.color}`,
            minHeight: '2.625rem',
            padding: '0 0.625rem',
          };
        } else {
          divStyle = {
            borderLeft: `4px solid ${item.color}`,
            minHeight: '2rem',
          };
        }
      } else {
        divStyle = {
          minHeight: '1.625rem',
          padding: '0 0.625rem',
        };
      }

      return (
        <li style={divStyle} className="bx--tooltip-list-item">
          {item.label && (
            <span className="bx--tooltip-list-item__label">{item.label}</span>
          )}
          <span className="bx--tooltip-list-item__data">{item.data}</span>
        </li>
      );
    });

    return items;
  }

  render() {
    const { className, direction, heading, isActive } = this.props;

    const tooltipClasses = classNames(
      'bx--tooltip',
      'bx--data-tooltip',
      {
        'bx--tooltip--shown': isActive,
      },
      className
    );

    return (
      <div className={tooltipClasses} data-floating-menu-direction={direction}>
        {heading && <p className="bx--tooltip__label">{heading}</p>}
        <ul className="bx--tooltip-list">{this.renderTooltipData()}</ul>
      </div>
    );
  }
}

DataTooltip.propTypes = propTypes;
DataTooltip.defaultProps = defaultProps;

export default DataTooltip;
