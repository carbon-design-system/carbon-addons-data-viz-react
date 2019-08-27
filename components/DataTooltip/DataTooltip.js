import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

const propTypes = {
  className: PropTypes.string,
  data: PropTypes.array,
  direction: PropTypes.string,
  id: PropTypes.string,
  heading: PropTypes.array,
  isActive: PropTypes.bool,
  hasSections: PropTypes.bool,
};

const defaultProps = {
  data: [100],
  direction: 'top',
  id: 'bx--data-tooltip',
  heading: null,
  isActive: true,
  hasSections: false,
};

class DataTooltip extends Component {
  renderTooltipData(data, heading) {
    const items = data.map((item, i) => {
      let divStyle;
      if (item.color) {
        if (data.length > 1 && heading) {
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
  getTootlTipClasses(isActive, className) {
    return classNames(
      'bx--tooltip',
      'bx--data-tooltip',
      {
        'bx--tooltip--shown': isActive,
      },
      className
    );
  }
  getTootleTipListClasses(data) {
    return classNames('bx--data-tooltip-list', {
      'bx--data-tooltip-list--block': data.length >= 4,
    });
  }
  getListStyle(data) {
    return {
      columnCount: data.length > 3 ? '2' : '1',
      columnGap: '1.25rem',
    };
  }
  getHeadingClasses(data) {
    return classNames('bx--data-tooltip__label', {
      'bx--data-tooltip__label--no-margin': data.length === 1,
    });
  }
  renderTooltipHeading(data, heading) {
    const headingClasses = this.getHeadingClasses(data);
    return heading && <p className={headingClasses}>{heading}</p>;
  }
  renderTooltipBody(data, heading) {
    const direction = this.props.direction;
    const tooltipListClasses = this.getTootleTipListClasses(data);
    const listStyle = this.getListStyle(data);
    if (data.length === 1 && data[0].color) {
      if (direction === 'top') {
        listStyle.borderTop = `4px solid ${data[0].color}`;
      } else if (direction === 'bottom') {
        listStyle.borderBottom = `4px solid ${data[0].color}`;
      }
    }
    return (
      <ul className={tooltipListClasses} style={listStyle}>
        {this.renderTooltipData(data, heading)}
      </ul>
    );
  }
  renderTooltipSections(data, heading) {
    var self = this;
    return data.map((section, i) => {
      return (
        <div>
          {self.renderTooltipHeading(data, heading[i])}
          {self.renderTooltipBody(section, heading[i])}
        </div>
      );
    });
  }
  renderAllSections(data, heading) {
    const sections = this.renderTooltipSections(data, heading);
    return sections.map(section => {
      return section;
    });
  }
  renderDefault(data, heading) {
    return (
      <div>
        {this.renderTooltipHeading(data, heading)}
        {this.renderTooltipBody(data, heading)}
      </div>
    );
  }
  render() {
    const {
      className,
      direction,
      heading,
      isActive,
      data,
      hasSections,
      ...other
    } = this.props;
    return (
      <div
        className={this.getTootlTipClasses(isActive, className)}
        data-floating-menu-direction={direction}
        {...other}>
        {hasSections
          ? this.renderAllSections(data, heading)
          : this.renderDefault(data, heading)}
      </div>
    );
  }
}

DataTooltip.propTypes = propTypes;
DataTooltip.defaultProps = defaultProps;

export default DataTooltip;
