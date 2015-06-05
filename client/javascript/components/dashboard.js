var React = require("react");
var isAuthorized = require("utility/is-authorized");

var Dashboard = React.createClass({
    statics: {
        willTransitionTo: function(transition, params, query, callback) {
            isAuthorized()
                .then(() => {
                    actions.fetch();
                    callback();
                })
                .catch(() => {
                    transition.redirect("login");
                    callback();
                });
        }
    },

    render: function() {
        return (
            <div className='dashboard'>
                TODO: add dashboard content
            </div>
        );
    }
});

module.exports = Dashboard;