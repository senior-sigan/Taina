/*jshint ignore:start */
const LoginComponent = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var masterKey = React.findDOMNode(this.refs.masterKey).value.trim();
    console.log(masterKey);
  },
  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type='password' ref='masterKey' />
        <input type='submit' value='Login' />
      </form>
    );
  }
});

module.exports = LoginComponent;
/*jshint ignore:end */
