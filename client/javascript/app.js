var React = require("react");

window.addEventListener('load', function() {
    //require("router");
    var Application = require("components/app");
    React.render(<Application/>, document.body);
}, false)