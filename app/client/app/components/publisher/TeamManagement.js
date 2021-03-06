"use strict"

import React, { PropTypes }     from 'react'
import { connect }              from 'react-redux'
import _                        from 'lodash'
import classNames               from 'classnames'
import { browserHistory }       from 'react-router'
import { toggleMainMenu }       from '../../actions/sync'
import { Link }                 from 'react-router'
import moment                   from 'moment'
import { getOIPAUser, getOrganisationGroupUsers } from '../../actions/async'
import { Tooltip } from '../general/Tooltip.react.jsx'

let TeamManagement = React.createClass({ // A stateful container all children are stateless

  componentWillMount: function() {
    this.props.toggleMainMenu(true)
    // this.props.getOIPAUser()
    //     .then(user => {
    //         console.log(user);
    //         // this.props.getOrganisationGroup
    //     })
  },

  render: function() {

    let wrapClass = classNames('pusher',{
      'pushed' : this.props.navState.menuState
    })

    let datasetsPublisher;
    if(this.props.publisher.validationStatus){
      datasetsPublisher = <DatasetsPublisher
        updateDataset={this.updateDataset}
        deleteDataset={this.deleteDataset}
        generateXmlFile={this.generateXmlFile}
        datasets={this.props.publisher.datasets} />
    } else {
      datasetsPublisher =
      (
        <div className="row">
          <div className="columns small-12">
            <p>You have to be validated with the IATI Registry first. Go to <Link to="/publisher/settings/">our publisher settings</Link> to set this up.</p>
          </div>
        </div>
      )
    }

    return (
        <div className={wrapClass}>
          <div className="row controls">
            <div className="columns small-centered small-12">
              <h2 className="page-title with-tip">Your IATI datasets</h2>
              <Tooltip className="inline" tooltip="Info text goes here"><i className="material-icons">info</i></Tooltip>
              <hr />
            </div>
          </div>
          {datasetsPublisher}
        </div>
    )
  }

})

function mapStateToProps(state, props) {
    return {
        publisher: state.publisher,
        navState: state.navState
    }
}

export default connect(mapStateToProps, {
  toggleMainMenu,
  getOIPAUser,
  getOrganisationGroupUsers,
})(TeamManagement)


const DatasetsPublisher = React.createClass({
  propTypes: {
    datasets: PropTypes.array.isRequired,
    deleteDataset: PropTypes.func.isRequired,
    generateXmlFile: PropTypes.func.isRequired
  },

  updateDataset: function(i) {
    this.props.updateDataset(this.props.datasets[i])
  },

  deleteDataset: function(i) {
    this.props.deleteDataset(this.props.datasets[i])
  },

  generateXmlFile: function(i) {
    this.props.generateXmlFile(this.props.datasets[i])
  },

  render: function () {

    const datasets = this.props.datasets.map((dataset, index) => {

      const ftIndex = _.findIndex(dataset.extras, function(o) { return o.key == 'filetype'; });
      const ftValue = dataset.extras[ftIndex].value;

      const acIndex = _.findIndex(dataset.extras, function(o) { return o.key == 'activity_count'; });
      const acValue = dataset.extras[acIndex].value;

      const duIndex = _.findIndex(dataset.extras, function(o) { return o.key == 'data_updated'; });
      const duValue = moment(dataset.extras[duIndex].value).format("MMM D YYYY HH:mm");


      // let urlValue = ;
      // // if(dataset.resources[0].url.indexOf("iatistudio.com") > -1){
      // //   urlValue = <a><i className="material-icons">done</i></a>
      // // }
      // // else {
      // //   urlValue = <PublisherButton value="Import" />
      // // }

      // let urlValue = <a href={dataset.resources[0].url} target="_blank">Click to open</a>

      let urlValue = <a href={"/static/iati-xml/"+dataset.name+".xml"} target="_blank" className="icon"><i className="material-icons">remove_red_eye</i></a>

      return <tr key={index}>
        <td>{dataset.name}</td>
        <td>{dataset.title}</td>
        <td>{ftValue}</td>
        <td>{acValue}</td>
        <td>{duValue}</td>
        <td className="align-right">{urlValue}</td>
        <td className="align-right"><a className="icon" onClick={this.generateXmlFile.bind(null, index)}><i className="material-icons">playlist_add</i></a></td>
        <td className="align-right"><a className="icon" onClick={this.updateDataset.bind(null, index)}><i className="material-icons">update</i></a></td>
        <td className="align-right"><a className="icon red" onClick={this.deleteDataset.bind(null, index)}><i className="material-icons">delete</i></a></td>
      </tr>
    })

    return (
        <div className="row">
          <div className="columns small-centered small-12">
            <table className="material-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Activity count</th>
                  <th>Date updated</th>
                  <th className="align-right" width="70">View XML</th>
                  <th className="align-right" width="70">Create XML</th>
                  <th className="align-right" width="70">Update</th>
                  <th className="align-right" width="70">Delete</th>
                </tr>
              </thead>
              <tbody>
                {datasets}
              </tbody>
            </table>
          </div>
        </div>
    )
  }

})
