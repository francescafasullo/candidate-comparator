import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {expect} from 'chai';
import {shallow, configure} from 'enzyme';
import {spy} from 'sinon';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

describe('React components', () => {
  let candidates = { data: [
  ['890', '62734', '64000', 'Engineer', '2'],
  ['893', '109561', '137014', 'Engineer', '2'],
  ['896', '138826', '151598', 'Senior Engineer', '2'],
  ['900', '61456', '63922', 'Senior Engineer', '3'],
  ['903', '172771', '182431', 'Engineer', '3']
  ] };

  let companies = { data: [
  ['2', '0.782'],
  ['3', '0.795']
  ] }

  describe('the component renders the correct data', () => {

    let component = shallow(<App />);
    let instance = component.instance();
    let selectedCandidate = candidates.data[3];

    it('has data', () => {
      expect(component.state()).to.have.property('candidateData')
    })

    it('searches candidate', () => {
      instance.setState({candidateData: candidates, companyData: companies})
      instance.searchCandidate({target: {id: {value: '900'}}, preventDefault: () => {}})

      expect(component.state('selectedCandidate')[0]).to.equal(selectedCandidate)
    })

    it('calculates the correct percentages', () => {
      instance.setState({candidateData: candidates, companyData: companies})
      instance.searchCandidate({target: {id: {value: '900'}}, preventDefault: () => {}})

      expect(component.state('codingPercentage')).to.equal('100.00')
      expect(component.state('communicationPercentage')).to.equal('100.00')
    })
  })
})
