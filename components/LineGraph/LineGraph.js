import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';

const propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

class LineGraph extends Component {
  render() {
    console.log(this.props);
    return <svg />;
  }
}

LineGraph.propTypes = propTypes;

export default LineGraph;
