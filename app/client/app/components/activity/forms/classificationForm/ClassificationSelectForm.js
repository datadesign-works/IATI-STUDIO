import React, {Component, PropTypes} from 'react';
import {Tooltip} from '../../../general/Tooltip.react.jsx'
import {GeneralLoader} from '../../../general/Loaders.react.jsx'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import { withRouter } from 'react-router'
import {Field, reduxForm} from 'redux-form'
import {getCodeListItems, getActivity, updateActivity} from '../../../../actions/activity'
import { publisherSelector } from '../../../../reducers/createActivity'
import {RenderSingleSelect, renderSelectField} from '../../helpers/FormHelper'

const validate = values => {
    const errors = {};
    if (!values.collaborationType) {
        errors.collaborationType = 'Required'
    }
    return errors
};

class ClassificationSelectForm extends Component {
    constructor(props) {
        super(props);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.activityId !== nextProps.activityId || this.props.publisher !== nextProps.publisher) {
            this.props.getActivity(nextProps.publisher.id, nextProps.activityId)
        }
    }

    /*
     * Submit activity data and redirect to country form.
     */
    handleFormSubmit(data) {
        const { activityId, publisher } = this.props;

        this.props.updateActivity(publisher.id, {
            id: activityId,
            ...data.activity,
        });

        this.props.router.push(`/publisher/activities/${activityId}/classifications/country`);
    }

    componentWillMount() {
        this.props.getCodeListItems('CollaborationType');
        this.props.getCodeListItems('FlowType');
        this.props.getCodeListItems('FinanceType');
        this.props.getCodeListItems('AidType');
        this.props.getCodeListItems('TiedStatus');
    }

    render() {
        const {codelists, handleSubmit, submitting, activityId } = this.props;

        if (!codelists['CollaborationType'] || !codelists['FlowType'] || !codelists['FinanceType']
                || !codelists['AidType'] || !codelists['TiedStatus']) {
            return <GeneralLoader />
        }

        return (
            <div className="columns small-centered small-12">
                <h2 className="page-title with-tip">Classification Types</h2>
                <Tooltip className="inline" tooltip="Description text goes here">
                    <i className="material-icons">info</i>
                </Tooltip>
                <form onSubmit={handleSubmit(this.handleFormSubmit)}>
                    <div className="field-list">
                        <RenderSingleSelect
                            name="activity.collaboration_type[code]"
                            textName="activity.collaboration_type[code]"
                            label='Collaboration Type'
                            selectOptions={codelists['CollaborationType']}/>
                    </div>
                    <div className="field-list">
                        <RenderSingleSelect
                            name="activity.default_flow_type[code]"
                            textName="activity.default_flow_type[code]"
                            label='Flow Type'
                            selectOptions={codelists['FlowType']}/>
                    </div>
                    <div className="field-list">
                        <RenderSingleSelect
                                name="activity.default_finance_type[code]"
                                textName="activity.default_finance_type[code]"
                                label='Default Finance Type'
                                selectOptions={codelists['FinanceType']}/>
                    </div>
                    <div className="field-list">
                        <RenderSingleSelect
                            name="activity.default_aid_type[code]"
                            textName="activity.default_aid_type[code]"
                            label='Default Aid Type'
                            selectOptions={codelists['AidType']}/>
                    </div>
                    <div className="field-list">
                        <RenderSingleSelect
                            name="activity.default_tied_status[code]"
                            textName="activity.default_tied_status[code]"
                            label='Default Tied Type'
                            selectOptions={codelists['TiedStatus']}/>
                    </div>
                    <div className="columns small-12">
                        <Link className="button" to={`/publisher/activities/${activityId}/classifications/policy`}>Back to policy</Link>
                        <button className="button float-right" type="submit" disabled={submitting}>
                            Continue to Country
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

ClassificationSelectForm = reduxForm({
    form: 'classifications-select',     // a unique identifier for this form
    destroyOnUnmount: false,
    enableReinitialize: true,
    validate
})(ClassificationSelectForm);


function mapStateToProps(state, props) {
    const { activityId } = props;
    let currentActivity = state.activity.activity && state.activity.activity[activityId];

    return {
        submitting: state.activity.submitting,
        activity: state.activity.activity,
        initialValues: {"activity": currentActivity},  // populate initial values for redux form
        codelists: state.codelists,
        publisher: publisherSelector(state),
    }
}

ClassificationSelectForm = connect(mapStateToProps, {
    getCodeListItems,
    getActivity,
    updateActivity,
})(ClassificationSelectForm);

export default withRouter(ClassificationSelectForm)
