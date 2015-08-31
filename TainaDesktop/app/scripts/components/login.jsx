import React from 'react';

const LoginComponent = React.createClass({
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="password" ref="masterKey" />
        <input type="submit" value="Login" />
      </form>
    );
  },
  handleSubmit(e) {
    e.preventDefault();
    const masterKey = React.findDOMNode(this.refs.masterKey).value.trim();
    console.log(masterKey);
  },
});

module.exports = LoginComponent;
