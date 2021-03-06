'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Candidates from './Candidate.jsx';
import Tickets from './Ticket.jsx';
import SingleBallot from './Single.jsx';
import MultipleBallot from './Multiple.jsx';
import Referendum from './Referendum.jsx';

var Election = React.createClass({
    getInitialState: function() {
        return {
            editTitle : false,
            showDateForm : false,
            title : '',
            startDate : '',
            endDate : '',
            unixStart : 0,
            unixEnd : 0,
            past : false
        };
    },

    componentDidMount: function() {
        this.load();
        this.initStartDate();
        this.initEndDate();
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (this.state.showDateForm) {
            this.initStartDate();
            this.initEndDate();
        }
    },

    initStartDate : function() {
        $('#start-date').datetimepicker({
            minDate: tomorrow,
            value : this.state.startDate,
            format : dateFormat,
            onChangeDateTime : function(ct, i) {
                this.updateStartDate(this.refs.startDate.value);
            }.bind(this)
        });
    },

    initEndDate : function() {
        $('#end-date').datetimepicker({
            minDate:0,
            format : dateFormat,
            value : this.state.endDate,
            onChangeDateTime : function(ct, i) {
                this.updateEndDate(this.refs.endDate.value);
            }.bind(this)
        });
    },

    changeStartDate: function(e) {
        this.updateStartDate(e.target.value);
    },

    changeEndDate: function(e) {
        this.updateEndDate(e.target.value);
    },

    hasDateErrors : function() {
        var error = false;

        if (this.state.startDate.length === 0) {
            $(this.refs.startDate).css('borderColor', 'red').attr('placeholder', 'Please enter a start date');
            error = true;
        } else if (this.state.unixStart > this.state.unixEnd) {
            $(this.refs.endDate).css('borderColor', 'red').attr('placeholder', 'End date must be greater').val('');
            this.setState({
                endDate : '',
                unixEnd : 0
            });
            error = true;
        }

        if (this.state.endDate.length === 0) {
            $(this.refs.endDate).css('borderColor', 'red').attr('placeholder', 'Please enter a end date');
            error = true;
        }

        return error;
    },

    updateStartDate : function(start) {
        var dateObj = new Date(start);
        var unix = dateObj.getTime() / 1000;
        this.setState({
            startDate : start,
            unixStart : unix
        });
    },

    updateEndDate : function(end) {
        var dateObj = new Date(end);
        var unix = dateObj.getTime() / 1000;
        this.setState({
            endDate : end,
            unixEnd : unix
        });
    },

    checkForConflict : function() {
        return $.getJSON('election/Admin/Election', {
            command: 'checkConflict',
            startDate: this.state.unixStart,
            endDate: this.state.unixEnd,
            electionId : this.props.electionId
        });
    },

    showStartCalendar : function() {
        $('#start-date').datetimepicker('show');
    },

    showEndCalendar : function() {
        $('#end-date').datetimepicker('show');
    },

    resetBorder : function(node) {
        $(node.target).removeAttr('style');
    },

    load: function() {
        // electionId loaded higher in script
        $.getJSON('election/Admin/Election', {
        	command : 'getElection',
            electionId : electionId
        }).done(function(data){
            this.setState({
                id : electionId,
                title : data.title,
                startDate : data.startDateFormatted,
                endDate: data.endDateFormatted,
                unixStart : data.startDate,
                unixEnd : data.endDate,
                editTitle : false,
                showDateForm : false,
            });
        }.bind(this));
    },

    editTitle : function()
    {
        this.setState({
            editTitle : true
        });
    },

    cancelUpdate : function()
    {
        this.setState({
            editTitle : false,
            title : this.state.title
        });
    },

    updateTitle : function(e) {
        this.setState({
            title : e.target.value
        });
    },

    saveTitle : function() {
        if (this.state.title.length > 0) {
            $.post('election/Admin/Election', {
                command : 'saveTitle',
                title : this.state.title,
                electionId : electionId
            }, null, 'json')
                .done(function(data){
                    this.load();
                }.bind(this));
        }
    },

    showDateForm: function() {
        this.setState({
            showDateForm : true
        });
    },

    hideDateForm : function() {
        this.setState({
            showDateForm : false
        });
    },

    saveDates : function() {
        var error = this.hasDateErrors();
        if (error === false) {
            var conflict = this.checkForConflict();
            conflict.done(function(data){
                if (data.conflict === false) {
                    $.post('election/Admin/Election', {
                        command : 'saveDates',
                        electionId : this.state.id,
                        startDate : this.state.unixStart,
                        endDate: this.state.unixEnd
                    }, null, 'json')
                    .done(function(data){
                        this.load();
                    }.bind(this))
                    .always(function(){
                        this.hideDateForm();
                    }.bind(this));
                } else {
                    $(this.refs.startDate).css('borderColor', 'red').attr('placeholder', 'Date conflict');
                    $(this.refs.endDate).css('borderColor', 'red').attr('placeholder', 'Date conflict');
                    this.setState({
                        startDate : '',
                        unixStart : 0,
                        endDate : '',
                        unixEnd : 0
                    });
                }
            }.bind(this));
        }
    },

    render: function() {
        var electionTitle = <h3 className="election-title" title="Click to change title" onClick={this.editTitle}>{this.state.title}</h3>;
        var save = null;

        if (this.state.editTitle) {
            electionTitle = (
            <div className="input-group">
                <input type="text" className="form-control election-title" placeholder="Election title" value={this.state.title} onChange={this.updateTitle}/>
                <span className="input-group-btn">
                    <button className="btn btn-success" title="Update title"
                        disabled={this.state.title.length === 0 ? true : false}
                        onClick={this.saveTitle}><i className="fa fa-save"></i>
                    </button>
                    <button className="btn btn-danger" title="Cancel update" onClick={this.cancelUpdate}><i className="fa fa-times"></i></button>
                </span>
            </div>
            );
        }

        if (!this.state.past) {
            if (this.state.showDateForm) {
                var date = (
                    <div className="row date-change pad-top">
                        <div className="col-sm-5">
                            <div className="input-group">
                                <input placeholder="Voting start date and time" ref="startDate" type="text" className="form-control datepicker" id="start-date"
                                    onFocus={this.resetBorder} onChange={this.changeStartDate} value={this.state.startDate}/>
                                <div className="input-group-addon">
                                    <i className="fa fa-calendar" onClick={this.showStartCalendar}></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-5">
                            <div className="input-group">
                                <input placeholder="Voting deadline" ref="endDate" type="text" className="form-control datepicker" id="end-date"
                                    onFocus={this.resetBorder} onChange={this.changeEndDate} value={this.state.endDate}/>
                                <div className="input-group-addon">
                                    <i className="fa fa-calendar" onClick={this.showEndCalendar}></i>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <button className="btn btn-success btn-sm" onClick={this.saveDates}><i className="fa fa-save"></i></button>&nbsp;
                            <button className="btn btn-danger btn-sm" onClick={this.hideDateForm}><i className="fa fa-times"></i></button>
                        </div>
                    </div>
                );
            } else {
                var date = (
                    <h4 onClick={this.showDateForm} title="Click to change dates"><span className="date-edit">{this.state.startDate}</span>&nbsp;-&nbsp;<span className="date-edit">{this.state.endDate}</span></h4>
                );
            }
        } else {
            var date = (
                <h4 className="date-view">{this.state.startDate} - {this.state.endDate}</h4>
            );
        }

        var details = <div className="text-center pad-top"><i className="fa fa-spinner fa-spin fa-5x"></i></div>;
        if (this.state.id) {
            details = (
                <div className="pad-top">
                    <SingleBallot electionId={this.state.id}/>
                    <MultipleBallot electionId={this.state.id}/>
                    <Referendum electionId={this.state.id}/>
                </div>
            );
        }
        return (
            <div>
                {electionTitle}
                {date}
                {allowChange ? null:<p><em>This is an ongoing election. Some options are disabled.</em></p>}
                <div>
                    {details}
                </div>
            </div>
        );
    },

});



ReactDOM.render(<Election/>, document.getElementById('election-dashboard'));
