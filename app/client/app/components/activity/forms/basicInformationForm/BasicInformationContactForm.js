import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Field, FieldArray, reduxForm} from 'redux-form'
import {Tooltip} from '../../../general/Tooltip.react.jsx'
import {GeneralLoader} from '../../../general/Loaders.react.jsx'
import {renderSelectField, renderNarrativeFields, renderField} from '../../helpers/FormHelper'
import { Link } from 'react-router';
import { getCodeListItems, getActivity, createContact, updateContact, deleteContact } from '../../../../actions/activity'
import handleSubmit from '../../helpers/handleSubmit'
import { contactsSelector, publisherSelector } from '../../../../reducers/createActivity.js'
import { withRouter } from 'react-router'
import _ from 'lodash';

const renderContactInfo = ({ fields, languageOptions, contactTypes, meta: {dirty, touched, error} }) => {
    if (!fields.length && !dirty) {
        fields.push({})
    }

    return (
        <div>
          {fields.map((contact, index) =>
              <div key={index}>
                  <div className="field-list" key={index}>
                      <div className="row no-margin">
                        <Field
                            component={renderSelectField}
                            name={`activity.${contact}type.code`}
                            textName={`activity.${contact}type.code`}
                            label="Contact type"
                            selectOptions={contactTypes}
                            defaultOption="Select a type"
                        />
                        <FieldArray
                            name={`activity.${contact}.narratives`}
                            component={renderNarrativeFields}
                            languageOptions={languageOptions}
                        />
                        <FieldArray
                            name={`activity.${contact}.department.narratives`}
                            component={renderNarrativeFields}
                            languageOptions={languageOptions}
                            textLabel="Department"
                            narrativeLabel={false}
                        />
                        <FieldArray
                          name={`activity.${contact}.organisation.narratives`}
                          component={renderNarrativeFields}
                          languageOptions={languageOptions}
                          textLabel="Organisation"
                          narrativeLabel={false}
                        />
                        <FieldArray
                            name={`activity.${contact}.person_name.narratives`}
                            component={renderNarrativeFields}
                            languageOptions={languageOptions}
                            textLabel="Person name"
                            narrativeLabel={false}
                        />
                        <FieldArray
                            name={`activity.${contact}.job_title.narratives`}
                            component={renderNarrativeFields}
                            languageOptions={languageOptions}
                            textLabel="Job title"
                            narrativeLabel={false}
                        />
                          <FieldArray
                              name={`activity.${contact}.mailing_address.narratives`}
                              component={renderNarrativeFields}
                              languageOptions={languageOptions}
                              textLabel="Mailing Address"
                              narrativeLabel={false}
                          />
                          <div className="row no-margin">
                              <div className="columns small-6">
                                  <Field
                                      name={`activity.${contact}.phone`}
                                      type="text"
                                      component={renderField}
                                      label="Phone"
                                  />
                              </div>
                          </div>
                          <div className="row no-margin">
                              <div className="columns small-6">
                                  <Field
                                      name={`activity.${contact}.email`}
                                      type="text"
                                      component={renderField}
                                      label="Email"
                                  />
                              </div>
                          </div>
                          <div className="row no-margin">
                              <div className="columns small-6">
                                  <Field
                                      name={`activity.${contact}.website`}
                                      type="text"
                                      component={renderField}
                                      label="Website"
                                  />
                              </div>
                          </div>
                    </div>
                  </div>
                  <div className="columns">
                      <button className="control-button add" type="button" onClick={() => fields.push({})}>Add More
                      </button>
                      <button
                          type="button"
                          title="Remove Title"
                          className="control-button remove float-right"
                          onClick={() => fields.remove(index)}>Delete
                      </button>
                      {touched && error && <span className="error">{error}</span>}
                  </div>
                  <br/><br/>
              </div>
            )}
      </div>
    )
};

const validate = values => {
  const errors = {};

  if (!values.type) {
    errors.type = 'Required'
  }

  if (!values.narrative) {
    const narrativeTextObj = {};
    narrativeTextObj.text = 'Required';
    errors.narrative = narrativeTextObj
  }

  return errors
};

class BasicInformationContactForm extends Component {
  constructor(props) {
    super(props);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  /**
   * Submit basic information's status data and redirect to status form.
   *
   * @param formData
   */
  handleFormSubmit(formData) {
      const {activityId, publisher, data} = this.props;
      let lastContacts = data;
      formData.activity.contact_info = formData.contact_info;
      let contacts = formData.activity.contact_info;
      lastContacts = _.filter(lastContacts, {});
      contacts = _.filter(contacts, {});

      handleSubmit(
          publisher.id,
          'contact_info',
          activityId,
          lastContacts,
          contacts,
          this.props.createContact,
          this.props.updateContact,
          this.props.deleteContact,
      );
      this.props.router.push(`/publisher/activities/${activityId}/participating-organisation/participating-organisation`)
  }

  componentWillMount() {
    this.props.getCodeListItems('ContactType');
    this.props.getCodeListItems('Language');
  }

    componentWillReceiveProps(nextProps) {
        if (this.props.activityId !== nextProps.activityId || this.props.publisher !== nextProps.publisher) {
            this.props.getActivity(nextProps.publisher.id, nextProps.activityId)
        }
    }

  render() {
      const {handleSubmit, submitting, data, codelists, activityId, activity } = this.props;

    if (!activity || !codelists["ContactType"] || !codelists["Language"]) {
      return <GeneralLoader/>
    }

    return (
      <div>
        <div className="row">
          <div className="columns small-centered small-12">
            <h2 className="page-title with-tip">Contact info</h2>
            <Tooltip className="inline" tooltip="Contact info text goes here">
              <i className="material-icons">info</i>
            </Tooltip>
            <form onSubmit={handleSubmit(this.handleFormSubmit)}>
              <div className="field-list">
                <FieldArray
                  name="contact_info"
                  component={renderContactInfo}
                  languageOptions={codelists["Language"]}
                  contactTypes={codelists["ContactType"]}
                />
              </div>
              <div className="columns small-12">
                <Link className="button" to={`/publisher/activity${activityId}/basic-info/date`}>Back to date</Link>
                <button className="button float-right" type="submit" disabled={submitting}>
                  Continue to Participating organisation
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
    const contacts = contactsSelector(state);
    const { activityId } = props;
    let currentActivity = state.activity.activity && state.activity.activity[activityId];

    return {
        data: contacts,
        codelists: state.codelists,
        activity: state.activity.activity,
        initialValues: {"activity": currentActivity},  // populate initial values for redux form
        publisher: publisherSelector(state),
        ...props,
    }
}

BasicInformationContactForm = reduxForm({
  form: 'basic-info-contact',     // a unique identifier for this form
  destroyOnUnmount: false,
  enableReinitialize: true,
  validate
})(BasicInformationContactForm);


BasicInformationContactForm = connect(mapStateToProps, {
    getCodeListItems,
    getActivity,
    createContact,
    updateContact,
    deleteContact
})(BasicInformationContactForm);

export default withRouter(BasicInformationContactForm)
