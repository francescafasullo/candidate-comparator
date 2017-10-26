import React, { Component } from 'react';
import './App.css';
import papa from 'papaparse';
import $ from 'jquery';
import scores from './data/score-records.csv';
import companies from './data/companies.csv';

const candidateID = 0;
const candidateCommunication = 1;
const candidateCoding = 2;
const candidateTitle = 3;
const candidateCompany = 4;
const companyId = 0;
const fractalScore = 1;

class App extends Component {

  constructor() {
    super()

    // sets up the state

    this.state = {
      candidateData: [],
      selectedCandidate: {},
      companyData: [],
      codingPercentage: 0,
      communicationPercentage: 0
    }

    // binds the "this" context of the searchCandidate method

    this.searchCandidate = this.searchCandidate.bind(this);
  }

  // reads the given data and sets it on the state

  componentDidMount() {
    $.get(scores, candidateData => {
      this.setState({candidateData: papa.parse(candidateData)});
    })
    $.get(companies, companyData => {
      this.setState({companyData: papa.parse(companyData)});
    })
  }

  // when the form is submitted, searchCandidate will find the desired candidate and their company, similar companies, similar candidates (from similar companies with similar roles), and will calculate the percentile that the candidate falls into in both coding and communitcation

  searchCandidate(evt) {

    // basic form data stuff, makes sure the page doesn't refresh on form submission and finds the desired candidate ID entered into the form

    evt.preventDefault();
    const id = evt.target.id.value;

    // searches all of the candidates to find the one with the matching ID and sets it on the state

    const candidate = this.state.candidateData.data.filter(entry => {
      return entry[candidateID] === id;
    })

    this.setState({selectedCandidate: candidate}, () => {

    // uses the companyID attached to the selected candidate to find the matching company in the company data

    const selectedCompanyId = candidate[0][candidateCompany];

    const company = this.state.companyData.data.filter(entry => {
      return entry[companyId] === selectedCompanyId;
    })

      // finds similar companies by comparing fractal scores

      const similar = this.state.companyData.data.filter(entry => {
        return Math.abs(entry[fractalScore] - company[0][fractalScore]) < 0.15;
      })

        // uses the IDs of similar companies and the role of the selected candidate to find similar candidates, filtering out the selected candidate

        let companyIds = similar.map(company => {
          return company[0][companyId];
        })
        const similarCandidates = this.state.candidateData.data.filter(entry => {
          return companyIds.indexOf(entry[candidateCompany]) > -1 && entry[candidateTitle] === this.state.selectedCandidate[0][candidateTitle] && entry[candidateID] !== this.state.selectedCandidate[0][candidateID];
        })

          // counts the number of similar candidates, adding 1 to account for the selected candidate (AKA this is the total number of candidates we are comparing)

          let numSimilar = similarCandidates.length + 1;

          // filters the similar candidates to find those who are better at coding than the selected candidate, using the length property to count how many of these candidates exist

          let numAboveCoding = similarCandidates.filter(candidate => {
            return parseInt(candidate[candidateCoding]) > parseInt(this.state.selectedCandidate[0][candidateCoding])
          }).length;

          // calculates what percentile the candidate is for coding by dividing the candidate's "rank" (the candidate is ranked 1 below the total number of candidates who are better at coding than he/she is) by the total number of candidates we are comparing

          // fixes the number to 2 decimal places for viewing simplicity

          let codingPercentage = (((numAboveCoding + 1) / numSimilar) * 100).toFixed(2);

          // sets the candidate's coding percentile on the state

          this.setState({codingPercentage: codingPercentage})

          // we repeat this process for the candidate's communication score

          let numAboveCommunication = similarCandidates.filter(candidate => {
            return parseInt(candidate[candidateCommunication]) > parseInt(this.state.selectedCandidate[0][candidateCoding])
          }).length;

          let communicationPercentage = (((numAboveCommunication + 1) / numSimilar) * 100).toFixed(2);

          this.setState({communicationPercentage: communicationPercentage});
    })

  }

  render() {

    let candidate = this.state.selectedCandidate[0];

    return (
      <div className="App">
        <nav>
          <h3>CandidateComparator</h3>
        </nav>
        <form onSubmit= {(evt) => this.searchCandidate(evt)}>
          <div className="form-group container">
            <div className="col-lg-6 col-md-6 col-sm-6 form-content">
              <input type="text" className="form-control candidate-search" name="id" placeholder="Enter a candidate ID"></input>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-6 form-content">
              <button className="btn btn-outline-secondary" type="submit">Search</button>
            </div>
          </div>
        </form>
        {
          this.state.selectedCandidate.length ?
          <div className="container">
            <div className="col-lg-12 col-md-12 col-sm-12">
            <h4>Candidate {candidate[candidateID]} is in the top {this.state.codingPercentage}% of candidates based on <b>coding</b> ability.</h4>
            <h4>Candidate {candidate[candidateID]} is in the top {this.state.communicationPercentage}% of candidates based on <b>communication</b> ability.</h4>
            </div>
          </div> : null
        }
      </div>
    );
  }
}

export default App;
