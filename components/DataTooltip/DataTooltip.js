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
  renderTooltipData() {
    const { data } = this.props;
    const items = data.map((item, i) => {
      let divStyle;
      if (item.color) {
        if (data.length <= 1) {
          divStyle = {
            borderTop: `4px solid ${item.color}`,
          };
        } else {
          divStyle = {
            borderLeft: `4px solid ${item.color}`,
          };
        }
      }

      const tooltipItemClasses = classNames(
        'bx--data-tooltip-list-item',
        {
          'bx--data-tooltip__base': !item.color && data.length <= 1,
        },
        {
          'bx--data-tooltip__single': item.color && data.length <= 1,
        },
        {
          'bx--data-tooltip__multiple': item.color && data.length > 1,
        },
        {
          'bx--data-tooltip__multiple--right':
            item.color && (data.length > 3 && i >= data.length / 2),
        },
        {
          'bx--data-tooltip__multiple--left':
            item.color && (data.length > 3 && i < data.length / 2),
        }
      );

      return (
        <li key={i} style={divStyle} className={tooltipItemClasses}>
          {item.label && (
            <span className="bx--data-tooltip-list-item__label">
              {item.label}
            </span>
          )}
          <span className="bx--data-tooltip-list-item__data">{item.data}</span>
        </li>
      );
    });

    return items;
  }

  render() {
    const {
      className,
      direction,
      heading,
      isActive,
      data,
      ...other
    } = this.props;

    const tooltipClasses = classNames(
      'bx--tooltip',
      'bx--data-tooltip',
      {
        'bx--tooltip--shown': isActive,
      },
      className
    );

    const tooltipListClasses = classNames('bx--data-tooltip-list', {
      'bx--data-tooltip-list--block': data.length >= 4,
    });

    const listStyle = {
      columnCount: data.length > 3 ? '2' : '1',
      columnGap: '1.25rem',
    };

    return (
      <div
        className={tooltipClasses}
        data-floating-menu-direction={direction}
        {...other}>
        {heading && <p className="bx--data-tooltip__label">{heading}</p>}
        <ul className={tooltipListClasses} style={listStyle}>
          {this.renderTooltipData()}
        </ul>
      </div>
    );
  }
}

DataTooltip.propTypes = propTypes;
DataTooltip.defaultProps = defaultProps;

export default DataTooltip;
