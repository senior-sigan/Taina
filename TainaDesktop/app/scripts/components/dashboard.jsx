import React from 'react';
import Router from 'react-router';
import moment from 'moment';

module.exports.create = (taina) => {
  const Dashboard = React.createClass({
    mixins: [Router.Navigation],

    getInitialState() {
      return {
        notes: [],
      };
    },

    componentDidMount() {
      taina.getNotes().then(notes => this.setState({notes: notes}));
    },

    render() {
      if (!taina.isLoggedOn()) {
        this.transitionTo('/login');
      }

      const notes = this.state.notes.map(note => {
        return (
          <tr>
            <td>{note.data.title}</td>
            <td>{moment(note.data.updatedAt).calendar()}</td>
          </tr>
        );
      });

      return (
        <div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              {notes}
            </tbody>
          </table>
          <div className="taina-button--fab">
            <button className="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
              <i className="material-icons">add</i>
            </button>
          </div>
        </div>
      );
    },
  });

  return Dashboard;
};
