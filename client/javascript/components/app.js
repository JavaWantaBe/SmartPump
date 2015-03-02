var React        = require("react"),
    Header       = require("components/header"),
    Navigation   = require("components/navigation"),
    Footer       = require("components/footer"),
    RouteHandler = require("react-router").RouteHandler;

var App = React.createClass({
    render: function() {
        return (
            <div className="app yui3-cssreset">
                <Header/>
                <Navigation/>
                <div className="content">
                    <RouteHandler/>
                </div>
                <Footer/>
            </div>
        );
    }
});

module.exports = App;
