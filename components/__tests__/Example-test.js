import React from 'react';
import Example from '../Example';
import { shallow, mount } from 'enzyme';

describe('Example', () => {
  describe('Renders as expected', () => {
    const wrapper = shallow(<Example>Lorem ipsum.</Example>);

    it('renders children as expected', () => {
      expect(wrapper.find('.example').text()).toBe('Lorem ipsum.');
    });
  });
});
