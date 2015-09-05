import React from 'react';

export default class Login extends React.Component {
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="password" ref="masterKey" />
        <input type="submit" value="Login" />
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    const masterKey = React.findDOMNode(this.refs.masterKey).value.trim();
    console.log(masterKey);
  }
}
