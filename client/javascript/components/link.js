var React = require("react");

class Link extends React.Component {
  render() {
    const {className, activeClassName, hash, href} = this.props;
    var isActive = (hash && hash === href.replace("#", ""));
    return (
      <a {...this.props} className={isActive ? `${className} ${activeClassName}` : className}></a>
    );
  }
}

Link.defaultProps = {
  href: "#",
  activeClassName: "",
  className: ""
};

module.exports = Link;