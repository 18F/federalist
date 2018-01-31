import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';

import ReduxFormAdvancedSiteSettings, { AdvancedSiteSettings } from '../../../../../frontend/components/site/SiteSettings/AdvancedSiteSettings';

describe('<AdvancedSiteSettings/>', () => {
  const makeProps = () => (
    {
      initialValues: {
        engine: 'jekyll',
        config: 'boop: beep',
      },
      onDelete: spy(),
      handleSubmit: spy(),
      reset: spy(),
      pristine: true,
    }
  );

  it('should export a ReduxForm-connected component', () => {
    expect(ReduxFormAdvancedSiteSettings).to.not.be.null;
  });

  it('should render', () => {
    const props = makeProps();
    const wrapper = shallow(<AdvancedSiteSettings {...props} />);
    const alertBanner = wrapper.find('AlertBanner');

    expect(wrapper.exists()).to.be.true;
    expect(wrapper.find('Field')).to.have.length(4);
    expect(wrapper.find('Field[name="engine"]').exists()).to.be.true;
    expect(wrapper.find('Field[name="config"]').exists()).to.be.true;
    expect(wrapper.find('Field[name="demoConfig"]').exists()).to.be.true;
    expect(wrapper.find('Field[name="previewConfig"]').exists()).to.be.true;
    expect(alertBanner).to.have.length(1);
    expect(alertBanner.prop('header')).to.be.defined;
    expect(alertBanner.prop('message')).to.be.defined;
  });

  it('should have its buttons disabled when pristine', () => {
    const props = makeProps();
    let wrapper = shallow(<AdvancedSiteSettings {...props} />);
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.find('button.usa-button-secondary').prop('disabled')).to.be.true;
    expect(wrapper.find('button[type="submit"]').prop('disabled')).to.be.true;

    props.pristine = false;
    wrapper = shallow(<AdvancedSiteSettings {...props} />);
    expect(wrapper.find('button.usa-button-secondary').prop('disabled')).to.be.false;
    expect(wrapper.find('button[type="submit"]').prop('disabled')).to.be.false;
  });

  it('should call onDelete when Delete button is clicked', () => {
    const props = makeProps();
    const wrapper = shallow(<AdvancedSiteSettings {...props} />);

    const deleteButton = wrapper.find('button.usa-button-red');
    expect(props.onDelete.called).to.be.false;
    deleteButton.simulate('click');
    expect(props.onDelete.calledOnce).to.be.true;
  });

  it('should call reset when Reset button is clicked', () => {
    const props = makeProps();
    props.pristine = false;
    const wrapper = shallow(<AdvancedSiteSettings {...props} />);
    const resetButton = wrapper.find('button.usa-button-secondary');

    expect(props.reset.called).to.be.false;
    resetButton.simulate('click');
    expect(props.reset.calledOnce).to.be.true;
  });

  it('should call handleSubmit when form is submitted', () => {
    const props = makeProps();
    props.pristine = false;
    const wrapper = shallow(<AdvancedSiteSettings {...props} />);
    const form = wrapper.find('form');

    expect(props.handleSubmit.called).to.be.false;
    form.simulate('submit');
    expect(props.handleSubmit.calledOnce).to.be.true;
  });
});
