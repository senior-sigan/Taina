import React from 'react';

module.exports.create = (taina) => {
  class Note extends React.Component {
    render() {
      return (
        <div class='secret'>
          <p>{this.props.title}</p>
        </div>
      );
    }
  }

  return Note;
};
