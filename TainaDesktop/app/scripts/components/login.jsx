/*jshint ignore:start */
window.LoginComponent = (function() {
  return React.createClass({
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
})();
/*jshint ignore:end */
