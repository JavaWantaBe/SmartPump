var React        = require("react"),
    Router       = require("react-router"),
    DefaultRoute = Router.DefaultRoute,
    Route        = Router.Route;

var routes = (
    <Route path="/" handler={require("components/app")}>
        <DefaultRoute handler={require("components/dashboard")}/>
        <Route name="dashboard" handler={require("components/dashboard")}/>
        <Route name="schedule" handler={require("components/schedule")}/>
        <Route name="settings" handler={require("components/settings")}/>
        <Route name="logs" handler={require("components/logs")}/>
        <Route name="login" handler={require("components/login")}/>
    </Route>
);

Router.run(routes, function(Handler) {
    React.render(<Handler/>, document.body);
});