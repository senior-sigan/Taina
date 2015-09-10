import React from 'react';
import Router from 'react-router';
import LoginCreator from './login.jsx';
import InitializerCreator from './initializer.jsx';
import DashboardCreator from './dashboard.jsx';
const Route = Router.Route;
const RouteHandler = Router.RouteHandler;
const DefaultRoute = Router.DefaultRoute;

module.exports.create = (taina) => {
  const Login = LoginCreator.create(taina);
  const Dashboard = DashboardCreator.create(taina);
  const Initializer = InitializerCreator.create(taina);

  class App extends React.Component {
    render() {
      return (
        <div>
          <h1>App</h1>
          <RouteHandler/>
        </div>
      );
    }
  }

  const routes = (
    <Route handler={App}>
      <Route path="login" handler={Login}/>
      <Route path="initialize" handler={Initializer}/>
      <Route path="dashboard" handler={Dashboard}/>
      <DefaultRoute handler={Login}/>
    </Route>
  );


  Router.run(routes, Router.HashLocation, (Root) => {
    React.render(<Root/>, document.getElementById('root'));
  });
};
