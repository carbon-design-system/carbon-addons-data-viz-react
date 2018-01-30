import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

const propTypes = {
  className: PropTypes.string,
  data: PropTypes.array,
  id: PropTypes.string,
  heading: PropTypes.string,
  isActive: PropTypes.bool,
};

const defaultProps = {
  data: [100],
  id: 'bx--data-tooltip',
  heading: 'Heading',
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
      return (
        <li className="bx--tooltip-list-item">
          <span>{item}</span>
          <span>Test</span>
        </li>
      );
    });

    return items;
  }

  render() {
    const { heading, isActive, className } = this.props;

    const tooltipClasses = classNames(
      'bx--tooltip',
      {
        'bx--tooltip--shown': isActive,
      },
      className
    );

    return (
      <div className={tooltipClasses} data-floating-menu-direction="right">
        <p className="bx--tooltip__label">{heading}</p>
        <ul className="bx--tooltip-list">{this.renderTooltipData()}</ul>
      </div>
    );
  }
}

DataTooltip.propTypes = propTypes;
DataTooltip.defaultProps = defaultProps;

export default DataTooltip;
