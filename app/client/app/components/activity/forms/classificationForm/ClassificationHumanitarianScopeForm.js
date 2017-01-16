import React, {Component, PropTypes} from 'react';
import {Field, FieldArray, reduxForm} from 'redux-form'
import {Tooltip} from '../../../general/Tooltip.react.jsx'
import {renderNarrativeFields, renderField, renderSelectField} from '../../helpers/FormHelper'
import {GeneralLoader} from '../../../general/Loaders.react.jsx'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {
    getCodeListItems,
    getHumanitarianScopes,
    createHumanitarianScope,
    updateHumanitarianScope,
    deleteHumanitarianScope
} from '../../../../actions/activity'
import handleSubmit from '../../helpers/handleSubmit'
import {humanitarianScopesSelector, publisherSelector} from '../../../../reducers/createActivity.js'
import {withRouter} from 'react-router'

const renderAdditionalRenderHumanitarianScopeForm = ({fields, vocabularyOptions, scopeOptions, languageOptions, meta: {touched, error}}) => (
    <div>
        {fields.map((description, index) =>
            <div className="field-list" key={index}>
                <RenderHumanitarianScopeForm
                    vocabularyOptions={vocabularyOptions}
                    scopeOptions={scopeOptions}/>
                <div className="row no-margin">
                    <FieldArray
                        name={`${description}`}
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


const RenderHumanitarianScopeForm = ({vocabularyOptions, scopeOptions, languageOptions}) =>
    (
        <div>
            <div className="row no-margin">
                <Field
                    component={renderSelectField}
                    name="type"
                    label="Type"
                    selectOptions={scopeOptions}
                    defaultOption="Select one of the following options"
                />
                <Field
                    component={renderSelectField}
                    name="vocabulary"
                    label="Vocabulary"
                    selectOptions={vocabularyOptions}
                    defaultOption="Select one of the following options"
                />
            </div>
            <div className="row no-margin">
                <div className="columns small-6">
                    <Field
                        name="vocabulary_uri"
                        type="text"
                        component={renderField}
                        label="Vocabulary URI"
                    />
                </div>
                <div className="columns small-6">
                    <Field
                        name="code"
                        type="text"
                        component={renderField}
                        label="Code"
                    />
                </div>
            </div>
            <div className="row no-margin">
                <FieldArray
                    name="additionalTitles"
                    component={renderNarrativeFields}
                    narrativeAddMore={false}
                    languageOptions={languageOptions}
                    textName="textPolicyTitle"
                    textLabel="Title"
                />
            </div>
        </div>
    );

const validate = values => {
    const errors = {};

    if (!values.vocabulary_uri) {
        errors.vocabulary_uri = 'Required'
    }
    if (!values.code) {
        errors.code = 'Required'
    }

    return errors
};

class HumanitarianScopeForm extends Component {
    constructor(props) {
        super(props);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    /**
     * Submit classification's humanitarian data.
     *
     * @param formData
     */
    handleFormSubmit(formData) {
        const {activityId, data, publisher} = this.props;
        const humanitarianScopes = formData.humanitarianScopes;

        handleSubmit(
            publisher.id,
            'humanitarianScopes',
            activityId,
            data,
            humanitarianScopes,
            this.props.createHumanitarianScope,
            this.props.updateHumanitarianScope,
            this.props.deleteHumanitarianScope,
        )
        //this.context.router.push('/publisher/activity/financial/financial');
    }

    static contextTypes = {
        router: PropTypes.object,
    };

    componentWillMount() {
        this.props.getCodeListItems('HumanitarianScopeType');
        this.props.getCodeListItems('HumanitarianScopeVocabulary');
        this.props.getCodeListItems('Language');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            const oldData = this.props.data
            const newData = nextProps.data

            // TODO: is a bug in redux-form, check https://github.com/erikras/redux-form/issues/2058 - 2016-12-22
            // this.props.change('humanitarianScopes', newData);

            // change each item
            newData.forEach((d, i) => this.props.change(`humanitarianScopes[${i}]`, d))

            // remove any removed elements if newData < oldData
            for (let i = newData.length; i < oldData.length; i++) {
                this.props.array.remove('humanitarianScopes', i)
            }
        }

        console.log(nextProps.publisher);

        if (this.props.activityId !== nextProps.activityId || this.props.publisher !== nextProps.publisher) {
            this.props.getHumanitarianScopes(nextProps.publisher.id, nextProps.activityId)
        }
    }


    render() {
        const {codelists, handleSubmit, submitting} = this.props;

        if (!codelists['HumanitarianScopeType'] || !codelists['HumanitarianScopeVocabulary'] || !codelists['Language']) {
            return <GeneralLoader />
        }

        return (
            <div className="columns small-centered small-12">
                <h2 className="page-title with-tip">Humanitarian Scope</h2>
                <Tooltip className="inline" tooltip="Description text goes here">
                    <i className="material-icons">info</i>
                </Tooltip>
                <form onSubmit={handleSubmit(this.handleFormSubmit)}>
                    <div className="field-list">
                        <RenderHumanitarianScopeForm
                            vocabularyOptions={codelists["HumanitarianScopeVocabulary"]}
                            scopeOptions={codelists["HumanitarianScopeType"]}
                            languageOptions={codelists["Language"]}
                        />
                    </div>
                    <FieldArray
                        name="additionalHumanitarianScope"
                        component={renderAdditionalRenderHumanitarianScopeForm}
                        vocabularyOptions={codelists["HumanitarianScopeVocabulary"]}
                        scopeOptions={codelists["HumanitarianScopeType"]}
                        languageOptions={codelists["Language"]}
                    />
                    <div className="columns small-12">
                        <Link className="button" to="/publisher/activity/classifications/country">Back to Country
                            Budget</Link>
                        <button className="button float-right" type="submit" disabled={submitting}>
                            Continue to Financial
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const humanitarian = humanitarianScopesSelector(state)

    return {
        data: humanitarian,
        codelists: state.codelists,
        initialValues: {"humanitarian": humanitarian},  // populate initial values for redux form
        publisher: publisherSelector(state),
        ...props,
    }
}

HumanitarianScopeForm = reduxForm({
    form: 'classifications-humanitarian-scope',     // a unique identifier for this form
    destroyOnUnmount: false,
    enableReinitialize: true,
    validate
})(HumanitarianScopeForm);


HumanitarianScopeForm = connect(mapStateToProps, {
    getCodeListItems, getHumanitarianScopes, createHumanitarianScope, updateHumanitarianScope, deleteHumanitarianScope
})(HumanitarianScopeForm);

export default withRouter(HumanitarianScopeForm);
