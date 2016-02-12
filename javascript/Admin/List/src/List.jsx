'use strict';

var ElectionList = React.createClass({
    getInitialState: function() {
        return {
            elections : [],
            showForm : false
        };
    },

    componentDidMount: function() {
        this.load();
    },

    load: function() {
        $.getJSON('election/Admin/Election', {
            command : 'list'
        }).done(function(data){
            this.setState({
                elections : data
            });
        }.bind(this));
    },

    showForm : function() {
        this.setState({
            showForm : true
        });
    },

    hideForm : function() {
        this.setState({
            showForm : false
        });
    },

    render: function() {
        var rows = this.state.elections.map((value, key) =>
            <ElectionRow key={key} {...value} hideForm={this.hideForm}/>
        );
        var form = <button className="btn btn-success" onClick={this.showForm}><i className="fa fa-plus"> Add Election</i></button>;
        if (this.state.showForm) {
            form = <ElectionForm hideForm={this.hideForm} load={this.load}/>;
        }
        return (
            <div>
                {form}
                <table className="table table-striped pad-top">
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
});

var ElectionRow = React.createClass({

    getDefaultProps: function() {
        return {
            id : 0,
            title : '',
            startDateFormatted : '',
            endDateFormatted : '',
            past : false,
            edit: false
        };
    },

    render: function() {
        if (this.props.past) {
            var href = 'election/Admin/Report/?electionId=' + this.props.id;
            var buttons = <a href={href} className="btn btn-primary"><i className="fa fa-envelope"></i> Report</a>
        } else {
            var href = 'election/Admin/?command=edit&electionId=' + this.props.id;
            var buttons = <a href={href} className="btn btn-primary"><i className="fa fa-edit"></i> Edit</a>;
        }
        return (
            <tr>
                <td>{this.props.title}</td>
                <td>{this.props.startDateFormatted} - {this.props.endDateFormatted}</td>
                <td>{buttons}</td>
            </tr>
        );
    }

});

var ElectionForm = React.createClass({
    mixins : [DateMixin],

    getInitialState: function() {
        return {
            title : '',
            startDate : '',
            endDate : '',
            unixStart : 0,
            unixEnd : 0
        };
    },

    getDefaultProps: function() {
        return {
            electionId : 0,
            title: '',
            startDate : '',
            endDate : '',
            hideForm : null
        };
    },

    componentDidMount: function() {
        this.initStartDate();
        this.initEndDate();
    },

    componentWillMount: function() {
        if (this.props.electionId) {
            this.copyPropsToState();
        }
    },


    copyPropsToState: function() {
        this.setState({
            title : this.props.title,
            startDate : this.props.startDateFormatted,
            endDate : this.props.endDateFormatted,
            unixStart : this.props.startDate,
            unixEnd : this.props.endDate
        });
    },


    updateTitle : function(e) {
        this.setState({
            title : e.target.value
        });
    },


    checkForErrors : function() {
        var error = false;
        if (this.state.title.length === 0) {
            $(this.refs.electionTitle).css('borderColor', 'red').attr('placeholder', 'Please enter a title');
            error = true;
        }

        if (this.hasDateErrors()) {
            error = true;
        }

        return error;
    },

    save : function() {
        var error = this.checkForErrors();
        if (error === false) {
            var conflict = this.checkForConflict();
            conflict.done(function(data){
                if (data.conflict === false) {
                    $.post('election/Admin/Election', {
                        command : 'save',
                        electionId : this.props.electionId,
                        title : this.state.title,
                        startDate : this.state.unixStart,
                        endDate: this.state.unixEnd
                    }, null, 'json')
                    .done(function(data){
                        this.props.load();
                    }.bind(this))
                    .always(function(){
                        this.props.hideForm();
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
        var title = (
            <input ref="electionTitle" type="text" className="form-control" defaultValue={this.props.title}
            id="election-title" onFocus={this.resetBorder} onChange={this.updateTitle} placeholder='Title (e.g. Fall 2016 Election)' />
        );
        var date =(
            <div className="row pad-top">
                <div className="col-sm-6">
                    <div className="input-group">
                        <input placeholder="Voting start date and time" ref="startDate" type="text" className="form-control datepicker" id="start-date"
                            onFocus={this.resetBorder} onChange={this.changeStartDate} value={this.state.startDate}/>
                        <div className="input-group-addon">
                            <i className="fa fa-calendar" onClick={this.showStartCalendar}></i>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="input-group">
                        <input placeholder="Voting deadline" ref="endDate" type="text" className="form-control datepicker" id="end-date"
                             onFocus={this.resetBorder} onChange={this.changeEndDate} value={this.state.endDate}/>
                        <div className="input-group-addon">
                            <i className="fa fa-calendar" onClick={this.showEndCalendar}></i>
                        </div>
                    </div>
                </div>
            </div>
        );
        var buttons = (
            <div>
                <button className="btn btn-primary btn-block" onClick={this.save}><i className="fa fa-save"></i> Save election</button>
                <button className="btn btn-danger btn-block" onClick={this.props.hideForm}><i className="fa fa-times"></i> Cancel</button>
            </div>
        );

        var heading = (
            <div className="row">
                <div className="col-sm-9">
                    {title}
                    {date}
                </div>
                <div className="col-sm-3">
                    {buttons}
                </div>
            </div>
        );

        return (
            <Panel type="info" heading={heading} />
        );
    }

});

ReactDOM.render(<ElectionList/>, document.getElementById('election-listing'));
