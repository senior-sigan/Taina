import React from 'react';
import Router from 'react-router';

module.exports.create = (taina) => {
  const Login = React.createClass({
    mixins: [Router.Navigation],

    handleSubmit(e) {
      e.preventDefault();
      const masterKey = React.findDOMNode(this.refs.masterKey);
      taina.login(masterKey.value.trim()).then(() => {
        console.log('logged in');
        masterKey.value = null;
        this.transitionTo('/dashboard');
      }).catch(err => {
        console.log(err);
      });
    },

    render() {
      return (
        <form onSubmit={this.handleSubmit}>
          <input type="password" ref="masterKey" />
          <input type="submit" value="Login" />
        </form>
      );
    },
  });

  return Login;
};
