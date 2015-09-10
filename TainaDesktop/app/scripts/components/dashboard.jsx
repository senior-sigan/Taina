import React from 'react';

module.exports.create = (taina) => {
  const Dashboard = React.createClass({
    getInitialState() {
      return {
        notes: [],
      };
    },

    componentDidMount() {
      taina.getNotes().then(notes => this.setState({notes: notes}));
    },

    render() {
      const notes = this.state.notes.map(note => {
        return (
          <div>
            <p>{note.data.title}</p>
            <p data-id="{note._id}">{note.data.body}</p>
            <a data-id="{note._id}">Show</a>
          </div>
        );
      });

      return (
        <div>
          {notes}
        </div>
      );
    },
  });

  return Dashboard;
};
