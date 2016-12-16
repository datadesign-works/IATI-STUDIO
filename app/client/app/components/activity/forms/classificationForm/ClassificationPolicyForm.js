import React from 'react'
import {Field, FieldArray, reduxForm} from 'redux-form'
import {Tooltip} from '../../../general/Tooltip.react.jsx'
import {renderNarrativeFields, renderField, renderSelectField} from '../../helpers/FormHelper'
import {GeneralLoader} from '../../../general/Loaders.react.jsx'
import {connect} from 'react-redux'
import { getCodeListItems, createActivity } from '../../../../actions/activity'

const renderPolicy = ({fields, languageOptions, policyCodeOptions, policyVocabularyOptions, meta: {touched, error}}) => (
  <div>
    {fields.map((description, index) =>
      <div className="field-list" key={index}>
        <div className="row no-margin">
          {
            !policyCodeOptions ?
              <GeneralLoader/> :
              <Field
                component={renderSelectField}
                name={`${description}.policy[code]`}
                label="Policy code"
                selectOptions={policyCodeOptions}
                defaultOption="Select one of the following options"
              />
          }
          {
            !policyCodeOptions ?
              <GeneralLoader/> :
              <Field
                component={renderSelectField}
                name={`${description}.policyMarkerVocabulary[code]`}
                label="Policy Vocabulary"
                selectOptions={policyCodeOptions}
                defaultOption="Select one of the following options"
              />
          }
          <div className="columns small-6">
            <Field
              name="uriPolicyText"
              type="text"
              component={renderField}
              label="Vocabulary URI"
            />
          </div>
          <div className="columns small-6">
            <Field
              name="percentagePolicyText"
              type="text"
              component={renderField}
              label="Percentage"
            />
          </div>
        </div>
        <div className="row no-margin">
          <FieldArray
            name={`${description}.additionalPolicy`}
            component={renderNarrativeFields}
            narrativeAddMore={false}
            languageOptions={languageOptions}
            textName="textPolicy"
            textLabel="Title"
          />
        </div>
      </div>
    )}
    <div className="columns">
      <button className="control-button add" type="button" onClick={() => fields.push({})}>Add More</button>
      <button
        type="button"
        title="Remove Title"
        className="control-button remove float-right"
        onClick={() => fields.pop()}>Delete
      </button>
      {touched && error && <span className="error">{error}</span>}
    </div>
  </div>
);

const validate = values => {
  const errors = {};

  if (!values.uriPolicyText) {
    errors.type = 'Required'
  }
  if (!values.percentagePolicyText) {
    errors.type = 'Required'
  }

  return errors
};

class PolicyMakerForm extends React.Component {

  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.props.getCodeListItems('PolicyMarker');
    this.props.getCodeListItems('PolicyMarkerVocabulary');
  }

  render() {
    const {activity} = this.props;

    return (
      <div className="columns small-centered small-12">
        <h2 className="page-title with-tip">Policy Makers</h2>
        <Tooltip className="inline" tooltip="Description text goes here">
          <i className="material-icons">info</i>
        </Tooltip>
        <div className="field-list">
          <div className="row no-margin">
            {
              !activity["PolicyMarker"] ?
                <GeneralLoader/> :
                <Field
                  component={renderSelectField}
                  name="policy[code]"
                  label="Policy code"
                  selectOptions={activity["PolicyMarker"]}
                  defaultOption="Select one of the following options"
                />
            }
            {
              !activity["PolicyMarkerVocabulary"] ?
                <GeneralLoader/> :
                <Field
                  component={renderSelectField}
                  name="policyMarkerVocabulary[code]"
                  label="Policy Vocabulary"
                  selectOptions={activity["PolicyMarkerVocabulary"]}
                  defaultOption="Select one of the following options"
                />
            }
          </div>
          <div className="row no-margin">
            <div className="columns small-6">
              <Field
                name="uriPolicyText"
                type="text"
                component={renderField}
                label="Vocabulary URI"
              />
            </div>
            <div className="columns small-6">
              <Field
                name="percentagePolicyText"
                type="text"
                component={renderField}
                label="Percentage"
              />
            </div>
          </div>
          <div className="row no-margin">
            <FieldArray
              name="additionalTitles"
              component={renderNarrativeFields}
              narrativeAddMore={false}
              languageOptions={activity["Language"]}
              textName="textPolicyTitle"
              textLabel="Title"
            />
          </div>
        </div>
        <FieldArray
          name="additionalPolicy"
          component={renderPolicy}
          languageOptions={activity["Language"]}
          policyCodeOptions={activity["PolicyMarker"]}
          policyVocabularyOptions={activity["PolicyMarkerVocabulary"]}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    activity: state.activity
  }
}

PolicyMakerForm = reduxForm({
  form: 'classifications-policy-maker',     // a unique identifier for this form
  destroyOnUnmount: false,
  validate
})(PolicyMakerForm);


PolicyMakerForm = connect(mapStateToProps, {getCodeListItems, createActivity})(PolicyMakerForm);
export default PolicyMakerForm;