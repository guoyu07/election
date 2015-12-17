var SingleBallot = React.createClass({
    mixins : ['Modal'],

    getInitialState: function() {
        return {
        };
    },

    getDefaultProps: function() {
        return {
        };
    },

    componentDidMount: function() {
        this.load();
    },

    showModal : function() {
        $('#single-modal').modal('show');
    },

    hideModal : function() {
        $('#single-modal').modal('hide');
    },

    load : function() {

    },

    render: function() {
        var modalForm = <SingleBallotForm reload={this.load} hideModal={this.hideModal}/>

        return (
            <div>
                <button className="btn btn-success" onClick={this.showModal}><i className="fa fa-plus"></i> Create ballot</button>
                <div className="modal-box"><Modal title="Create Ballot" modalId="single-modal" body={modalForm}/></div>
                <p>Other stuff that should remain</p>
            </div>
        );
    }

});

var SingleBallotForm = React.createClass({

    getInitialState: function() {
        return {
            ballotId : 0,
            title : '',
            startDate : '',
            endDate : ''
        }
    },

    getDefaultProps: function() {
        return {
        };
    },

    componentDidMount: function() {
        this.initStartDate();
        this.initEndDate();
    },

    initStartDate : function() {
        $('#start-date').datetimepicker({
            minDate:0,
            onChangeDateTime : function(ct, i) {
                this.setState({
                    startDate : this.refs.startDate.value
                });
            }.bind(this)
        });
    },

    initEndDate : function() {
        $('#end-date').datetimepicker({
            minDate:0,
            onChangeDateTime : function(ct, i) {
                this.setState({
                    endDate : this.refs.endDate.value
                });
            }.bind(this)
        });
    },

    showStartCalendar : function() {
        $('#start-date').datetimepicker('show');
    },

    showEndCalendar : function() {
        $('#end-date').datetimepicker('show');
    },

    updateTitle : function(e) {
        this.setState({
            title : e.target.value
        });
    },

    updateStartDate : function(e) {
        this.setState({
            startDate : e.target.value
        });
    },

    updateEndDate : function(e) {
        this.setState({
            endDate : e.target.value
        });
    },

    checkForErrors : function() {
        var error = false;
        if (this.state.title.length === 0) {
            $(this.refs.ballotTitle).css('borderColor', 'red').attr('placeholder', 'Please enter a title');
            error = true;
        }

        if (this.state.startDate.length === 0) {
            $(this.refs.startDate).css('borderColor', 'red').attr('placeholder', 'Please enter a start date');
            error = true;
        } else if (this.state.startDate > this.state.endDate) {
            $(this.refs.endDate).css('borderColor', 'red').attr('placeholder', 'End date must be greater').val('');
            this.setState({
                endDate : ''
            });
            error = true;
        }

        if (this.state.endDate.length === 0) {
            $(this.refs.endDate).css('borderColor', 'red').attr('placeholder', 'Please enter a end date');
            error = true;
        }

        return error;
    },

    save : function() {

        var error = this.checkForErrors();

        if (error === false) {
            $.post('election/Admin/Single', {
            	command : 'save',
                ballotId : this.state.ballotId,
                title : this.state.title,
                startDate : this.state.startDate,
                endDate: this.state.endDate
            }, null, 'json')
            	.done(function(data){
                    this.props.reload();
            	}.bind(this))
                .always(function(){
                    this.props.hideModal();
                }.bind(this));

        }
    },

    resetBorder : function(node) {
        $(node.target).removeAttr('style');
    },

    render: function() {
        return (
            <form>
                <div className="form-group">
                    <label htmlFor="ballot-title" className="control-label">Title:</label>
                    <input ref="ballotTitle" type="text" className="form-control" id="ballot-title" onFocus={this.resetBorder} onChange={this.updateTitle}/>
                </div>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="form-inline">
                            <div className="form-group">
                                <label htmlFor="start-date" className="control-label">Start voting:</label>
                                <div className="input-group">
                                    <input ref="startDate" type="text" className="form-control datepicker" id="start-date"  onFocus={this.resetBorder} onChange={this.updateStartDate}/>
                                    <div className="input-group-addon">
                                        <i className="fa fa-calendar" onClick={this.showStartCalendar}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-inline">
                            <div className="form-group">
                                <label htmlFor="end-date" className="control-label">End voting:</label>
                                <div className="input-group">
                                    <input ref="endDate" type="text" className="form-control datepicker" id="end-date" onFocus={this.resetBorder} onChange={this.updateEndDate}/>
                                    <div className="input-group-addon">
                                        <i className="fa fa-calendar" onClick={this.showEndCalendar}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="pull-right">
                    <button type="button" className="btn btn-danger" data-dismiss="modal"><i className="fa fa-times"></i> Cancel</button>&nbsp;
                    <button type="button" className="btn btn-primary" onClick={this.save}><i className="fa fa-save"></i> Save</button>
                </div>
                <div className="clearfix"></div>
            </form>
        );
    }
});


ReactDOM.render(<SingleBallot/>, document.getElementById('single-ballot'));
