import React from 'react';
import Router from 'react-router';

module.exports.create = (taina) => {
  const Login = React.createClass({
    mixins: [Router.Navigation],

    handleSubmit(e) {
      e.preventDefault();
      const masterKey = React.findDOMNode(this.refs.masterKey);
      taina.login(masterKey.value.trim()).then(() => {
        console.log('Created new Taina');
        masterKey.value = null;
        this.transitionTo('/dashboard');
      }).catch(err => {
        console.log(err);
      });
    },

    render() {
      if (!taina.isEmpty()) {
        this.transitionTo('/login');
      }
      return (
        <div>
          <form onSubmit={this.handleSubmit}>
            <input type="password" ref="masterKey" />
            <input type="submit" value="Create Taina" />
          </form>
          <a>Load data from dropbox</a>
        </div>
      );
    },
  });

  return Login;
};
