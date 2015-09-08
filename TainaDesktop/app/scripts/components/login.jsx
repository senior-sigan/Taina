import React from 'react';

module.exports.create = (taina) => {
  class Login extends React.Component {
    constructor() {
      super();
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
      e.preventDefault();
      const masterKey = React.findDOMNode(this.refs.masterKey);
      taina.login(masterKey.value.trim()).then(() => {
        console.log('logged in');
        masterKey.value = null;
      }).catch(err => {
        console.log(err);
      });
    }

    render() {
      return (
        <form onSubmit={this.handleSubmit}>
          <input type="password" ref="masterKey" />
          <input type="submit" value="Login" />
        </form>
      );
    }
  }

  return Login;
};
